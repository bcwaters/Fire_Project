# Fire Project
  Gather daily data for wildland firefighting incidents



## Running Locally
In order to run locally the server needs current data. Currently data is parsed from the Daily SIT report pdf. The seed data script will send a curl request to download the pdf locally.  
From the web_server directory run the python script seed_data.py
```python seed_data.py```

now simply run the server
```npm run dev```

## Backend
This is running on an ec2 server which is collecting daily data with cron job and then serving files directly with NGINX
