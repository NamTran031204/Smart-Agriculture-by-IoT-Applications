#include <Arduino.h>

#include "DHT.h"
#include<WiFi.h>
#include<WiFiClientSecure.h>
#include<string.h>
#include<time.h>

#include <PubSubClient.h>
#include <ArduinoJson.h>

#include "environment.config.h"

//timer
unsigned long lastDataSend = 0;
const long sendInterval = SEND_INTERVAL;

//mqtt client
WiFiClientSecure espClientSecure;
PubSubClient client(espClientSecure);

String getISOTimestamp();
void reconnectMQTT();

void pinsSetup();
void setupOutputStatus();

void publishSensorData(float temp, float humid, int optical, float moisture);
void mqttCallback(char* topic, byte* payload, unsigned int length);
void setupWifi();
void checkAlerts(float temp, float humid, int optical, float moisture);

float readTemperature();
float readHumidity();
float readSoilMoisture();
int readLightIntensity();

DHT dht(DHTPin, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(5000);

  pinsSetup();

  setupOutputStatus();

  dht.begin();

  setupWifi();

  //time config
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);

  struct tm timeInfor;
  while (!getLocalTime(&timeInfor)) 
  {
    Serial.println("Waiting for time sync...");
    delay(1000);
  }
  Serial.println(&timeInfor, "Current time: %Y-%m-%d %H:%M:%S");

  //mqtt config
  espClientSecure.setInsecure();
  client.setServer(MQTT_HOST, MQTT_PORT);
  client.setCallback(mqttCallback);

}

void loop() {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    setupWifi();
  }

  if (!client.connected()) {
    reconnectMQTT();
  }

  client.loop(); // giu ket noi voi broker

  //doc gia tri cam bien
  float temp = readTemperature();
  float humid = readHumidity();
  float moisture = readSoilMoisture();
  int optical = readLightIntensity();

  String timestamp = getISOTimestamp();
  Serial.print("Time: ");
  Serial.print(timestamp);
  Serial.print(" | Temp: ");
  Serial.print(temp);
  Serial.print("°C | Humid: ");
  Serial.print(humid);
  Serial.print("% | Moisture: ");
  Serial.print(moisture);
  Serial.print("% | Optical: ");
  Serial.print(optical);
  Serial.println("%");

  unsigned long now = millis();
  if (now - lastDataSend > sendInterval) {
    lastDataSend = now;
    
    publishSensorData(temp, humid, optical, moisture);
  }

  delay(READ_INTERVAL);
}

void pinsSetup() {
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(LIGHT_SENSOR_AO, INPUT);

  pinMode(PUMP_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  pinMode(HUMIDIFIER_PIN, OUTPUT);
}

void setupOutputStatus() {
  digitalWrite(PUMP_PIN, LOW);
  digitalWrite(FAN_PIN, LOW);
  digitalWrite(LIGHT_PIN, LOW);
  digitalWrite(HUMIDIFIER_PIN, LOW);
}

void publishSensorData(float temp, float humid, int optical, float moisture) {

  checkAlerts(temp, humid, optical, moisture);

  // time_t now;
  // time(&now);

  String timestamp = getISOTimestamp();

  Serial.print("Publishing sensor data at ");
  Serial.print(timestamp);

  //json packaging
  JsonDocument doc;
  doc["timestamp"] = timestamp;
  doc["temp"] = temp;
  doc["humid"] = humid;
  doc["optical"] = optical;
  doc["moisture"] = moisture;

  Serial.print(" | Publishing sensor data: ");
  Serial.println(doc.as<String>());

  char payload[256];
  serializeJson(doc, payload);

  Serial.println("Payload: ");
  Serial.println(payload);

  if (client.publish(TOPIC_DATA_SENSORS, payload)) {
    Serial.printf("Published to topic %s: %s\n", TOPIC_DATA_SENSORS, payload);
  } else {
    Serial.printf("Failed to publish to topic %s\n", TOPIC_DATA_SENSORS);
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message den: [");
  Serial.print(topic);
  Serial.print("] ");

  char payloadStr[length + 1];
  memcpy(payloadStr, payload, length);
  payloadStr[length] = '\0';
  String payloadString = String(payloadStr);
  Serial.println(payloadString);

  char* stateTopic = NULL;

  // logic
  if (strstr(topic, "/pump")) {
    stateTopic = TOPIC_STATE_PUMP;
    if (payloadString == "ON") {
      Serial.println("pump on");
      digitalWrite(PUMP_PIN, HIGH);
    } else if (payloadString == "OFF") {
      Serial.println("pump off");
      digitalWrite(PUMP_PIN, LOW);
    }
  } 
  else if (strstr(topic, "/fan")) {
    stateTopic = TOPIC_STATE_FAN;
    if (payloadString == "ON") {
      Serial.println("fan on");
      digitalWrite(FAN_PIN, HIGH);
    } else if (payloadString == "OFF") {
      Serial.println("fan off");
      digitalWrite(FAN_PIN, LOW);
    }
  }
  else if (strstr(topic, "/light")) {
    stateTopic = TOPIC_STATE_LIGHT;
    digitalWrite(LIGHT_PIN, HIGH);
    Serial.println("light on");
  }
  else if (strstr(topic, "/humidifier")) {
    stateTopic = TOPIC_STATE_HUMIDIFIER;
    digitalWrite(HUMIDIFIER_PIN, HIGH);
    Serial.println("humidifier on");
  }

  if (stateTopic != NULL) {
    if (client.publish(stateTopic, payloadStr)) {
      Serial.printf("Replied state to %s: %s\n", stateTopic, payloadStr);
    } else {
      Serial.println("Failed to publish state");
    }
  }
}

void setupWifi()
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Connecting");

  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to internet with IP address: ");
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    String clientId = "esp32-01";
    if (client.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println("connected");
      
      if (client.subscribe(TOPIC_CMD_WILDCARD)) {
        Serial.printf("Subscribed to topic: %s\n", TOPIC_CMD_WILDCARD);
      } else {
        Serial.println("Subscription failed!");
      }
    } else {
      Serial.print(client.state());
      Serial.println("thu lai sau 5s");
      delay(5000);
    }
  }
}

void checkAlerts(float temp, float humid, int optical, float moisture) {
  
  JsonDocument alertDoc;
  JsonArray alerts = alertDoc.to<JsonArray>(); 
  
  char alertPayload[512];

  if (temp > TEMP_HIGH_THRESHOLD) {
    JsonObject alert = alerts.add<JsonObject>();
    alert["type"] = "HIGH_TEMP";
    alert["value"] = temp;
    alert["message"] = "Nhiet do qua cao!";
  } 
  
  if (moisture < MOISTURE_LOW_THRESHOLD) {
    JsonObject alert = alerts.add<JsonObject>();
    alert["type"] = "LOW_MOISTURE";
    alert["value"] = moisture;
    alert["message"] = "Dat qua kho, can tuoi cay!";
  }
  
  if (humid > HUMID_HIGH_THRESHOLD) {
    JsonObject alert = alerts.add<JsonObject>();
    alert["type"] = "HIGH_HUMIDITY";
    alert["value"] = humid;
    alert["message"] = "Do am khong khi qua cao, nguy co nam moc!";
  }

  if (alerts.size() > 0) {
    serializeJson(alertDoc, alertPayload);

    if (client.publish(TOPIC_ALERT, alertPayload)) {
      Serial.printf("!!! Published ALERTS to %s: %s\n", TOPIC_ALERT, alertPayload);
    } else {
      Serial.printf("Failed to publish alert to %s\n", TOPIC_ALERT);
    }
  }
}

float readTemperature() {
  float temp = dht.readTemperature();
  if(isnan(temp)){
    // send request to user to control;

    Serial.println("DHT temperature sensor was failed");
  }
  return temp;
}

float readHumidity() {
  float humid = dht.readHumidity();
  if(isnan(humid)){
    // send request to user to control;

    Serial.println("DHT humidity sensor was failed");
  }
  return humid;
}

float readSoilMoisture() {
  int sensorValue = analogRead(SOIL_MOISTURE_PIN);

  Serial.print("Raw Soil Moisture Sensor Value: ");
  Serial.println(sensorValue);

  float moisturePercent = map(sensorValue, WATER_VALUE, AIR_VALUE, 100, 0); // tức là chuyển đổi giá trị đọc thành phần trăm so với để khô ngoài không khí và ngâm trong nước
  moisturePercent = constrain(moisturePercent, 0, 100); // khống chế trong khoảng 0-100%
  return moisturePercent;
}

int readLightIntensity() {
  int rawValue = analogRead(LIGHT_SENSOR_AO);

  Serial.print("Raw Light Sensor Value: ");
  Serial.println(rawValue);

  int lightPercent = map(rawValue, LIGHT_DARK_VALUE, LIGHT_BRIGHT_VALUE, 0, 100);
  lightPercent = constrain(lightPercent, 0, 100);
  return lightPercent;
}

String getISOTimestamp(){
  struct tm timeInfor;
  if(!getLocalTime(&timeInfor)){
    Serial.println("failed to set time");
    return String(millis());
  }

  char timeString[30];
  //ISO 8601
  strftime(timeString, sizeof(timeString), "%Y-%m-%dT%H:%M:%SZ", &timeInfor);
  Serial.println(String(timeString));
  return String(timeString);
}