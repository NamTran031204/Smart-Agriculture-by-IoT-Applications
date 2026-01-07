#ifndef CONFIG_PUBLISH_H
#define CONFIG_PUBLISH_H

// WiFi Configuration
#define WIFI_SSID ""
#define WIFI_PASSWORD ""

//mqtt client
#define MQTT_HOST "blabla.s1.eu.hivemq.cloud"
#define MQTT_PORT 8883
#define MQTT_USER "name"
#define MQTT_PASS "password"

//topic api
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
#define MOISTURE_LOW_THRESHOLD 30.0
#define HUMID_HIGH_THRESHOLD 85.0

//sensor pin config
#define DHTPin 16
#define DHTTYPE DHT22
#define SOIL_MOISTURE_PIN 34
#define LIGHT_SENSOR_AO 35

// Sensor Calibration Values
#define AIR_VALUE 3500 // Giá trị khi cảm biến ở trong không khí (khô hoàn toàn)
#define WATER_VALUE 1500 // Giá trị khi cảm biến ngâm trong nước (ướt hoàn toàn)
#define LIGHT_DARK_VALUE 4095 // CÀNG TỐI CÀNG CAO
#define LIGHT_BRIGHT_VALUE 0  // CÀNG SÁNG CÀNG THẤP

// Time Configuration
#define NTP_SERVER "pool.ntp.org"
#define GMT_OFFSET_SEC 25200
#define DAYLIGHT_OFFSET_SEC 0

// Timer Configuration
#define SEND_INTERVAL 60000  // 60 seconds
#define READ_INTERVAL 2000

// controller
#define PUMP_PIN 26
#define FAN_PIN 27
#define LIGHT_PIN 14
#define HUMIDIFIER_PIN 12

#endif