# Smart-Agriculture-by-IoT-Applications

# How to run Frontend

## Note:
Must run 2 docker service and run file SmartgardenApplication.java in backend first 

## Run only 2 docker service:

```
docker-compose up postgres-db mosquitto
```

## Then run file SmartgardenApplication.java in InteljIDEA

## When done navigate to frontend and do the following:
```
cd smart-garden-iot
```

# Create .env file with content like file .env.example
```
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env
```
# 2. Cài đặt dependencies cơ bản
```
npm install
```

# 3. Cài đặt thư viện bổ sung
```
npm install lucide-react axios
```

# 4. Run frontend
```
npm run dev
```