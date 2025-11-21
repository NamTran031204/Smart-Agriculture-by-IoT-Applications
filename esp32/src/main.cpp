#include <Arduino.h>

#include "DHT.h"
#include<WiFi.h>
#include<WiFiClientSecure.h>
#include<string.h>
#include<time.h>

#include <PubSubClient.h>
#include <ArduinoJson.h>

#include "environment.config.h"

DHT dht(DHTPin, DHTTYPE);

//time config
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 25200;
const int daylightOffset_sec = 0;

//timer
unsigned long lastDataSend = 0;
const long sendInterval = 60000;

//mqtt client
WiFiClientSecure espClientSecure;
PubSubClient client(espClientSecure);

String getISOTimestamp();
void reconnectMQTT();
void publishSensorData(float temp, float humid, int optical, float moisture);
void mqttCallback(char* topic, byte* payload, unsigned int length);
void setupWifi();
void checkAlerts(float temp, float humid, int optical, float moisture);

float readTemperature();
float readHumidity();
float readSoilMoisture();
int readLightIntensity();

void setup() {
  Serial.begin(115200);
  delay(5000);

  dht.begin();
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(LIGHT_SENSOR_AO, INPUT);

  setupWifi();

  //time config
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

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

  delay(2000);
}

void publishSensorData(float temp, float humid, int optical, float moisture) {

  checkAlerts(temp, humid, optical, moisture);

  // time_t now;
  // time(&now);

  String timestamp = getISOTimestamp();

  Serial.print("Publishing sensor data at ");
  Serial.print(timestamp);

  //json packaging
  StaticJsonDocument<256> doc;
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
      //digital write cho pump
    } else if (payloadString == "OFF") {
      Serial.println("pump off");
      //digital write cho pump
    }
  } 
  else if (strstr(topic, "/fan")) {
    stateTopic = TOPIC_STATE_FAN;
    if (payloadString == "ON") {
      Serial.println("fan on");
      //digital write cho fan
    } else if (payloadString == "OFF") {
      Serial.println("fan off");
      //digital write cho fan
    }
  }
  else if (strstr(topic, "/light")) {
    stateTopic = TOPIC_STATE_LIGHT;
     // light on/off - setup thoi gian sang den
     Serial.println("light on");
  }
  else if (strstr(topic, "/humidifier")) {
    stateTopic = TOPIC_STATE_HUMIDIFIER;
    // may phun suong on/off
    Serial.println("humidifier on");
  }

  if (stateTopic != NULL) {
    client.publish(stateTopic, payloadStr);
    Serial.printf("Replied state to %s: %s\n", stateTopic, payloadStr);
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
  
  StaticJsonDocument<512> alertDoc; 
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
    temp = NULL;

    // send request to user to control;

    Serial.println("DHT temperature sensor was failed");
  }
  return temp;
}

float readHumidity() {
  float humid = dht.readHumidity();
  if(isnan(humid)){
    humid = NULL;

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