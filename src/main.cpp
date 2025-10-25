#include <Arduino.h>

#include "DHT.h"
#include<WiFi.h>
#include<WiFiClientSecure.h>
#include<string.h>
#include<time.h>

#include <PubSubClient.h>
#include <ArduinoJson.h>

//wifi config
#define WIFI_SSID "NamChan"
#define WIFI_PASSWORD "namDepZai"

//mqtt client
#define MQTT_HOST "5b0f7f52fc5048cd80d158e2189eb0e8.s1.eu.hivemq.cloud"
#define MQTT_PORT 8883
#define MQTT_USER "esp32-client"
#define MQTT_PASS "Esp32-123456"

//topic
#define DEVICE_ID "esp32-01"
#define TOPIC_DATA_SENSORS "garden/data/esp32-01/sensors"
#define TOPIC_CMD_WILDCARD "garden/command/esp32-01/#"
#define TOPIC_STATE_PUMP   "garden/state/esp32-01/pump"
#define TOPIC_STATE_FAN    "garden/state/esp32-01/fan"
#define TOPIC_STATE_LIGHT  "garden/state/esp32-01/light"
#define TOPIC_STATE_HUMIDIFIER "garden/state/esp32-01/humidifier"

//warning
#define TOPIC_ALERT "garden/alert/esp32-01"
#define TEMP_HIGH_THRESHOLD 35.0
#define MOISTURE_LOW_THRESHOLD 300
#define HUMID_HIGH_THRESHOLD 85.0

//dht config
#define DHTPin 16
#define DHTTYPE DHT22
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
void publishSensorData();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void setupWifi();
void checkAlerts(float temp, float humid, int optical, int moisture);

void setup() {
  Serial.begin(115200);
  delay(5000);

  dht.begin();
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

  unsigned long now = millis();
  if (now - lastDataSend > sendInterval) {
    lastDataSend = now;
    
    publishSensorData();
  }
}

void publishSensorData() {
  float temp = dht.readTemperature();
  float humid = dht.readHumidity();

  //giả lập tai chua mua cam bien
  int optical = 800;   // nếu trời sáng trong khoảng bao nhiêu thì bật 0,1,2 đèn, tối quá thì bật 3 đèn
  int moisture = 450;

  if (isnan(temp) || isnan(humid)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  checkAlerts(temp, humid, optical, moisture);

  time_t now;
  time(&now);

  //json packaging
  StaticJsonDocument<256> doc;
  doc["timestamp"] = now;
  doc["temp"] = temp;
  doc["humid"] = humid;
  doc["optical"] = optical;
  doc["moisture"] = moisture;

  char payload[256];
  serializeJson(doc, payload);

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

void checkAlerts(float temp, float humid, int optical, int moisture) {
  
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

