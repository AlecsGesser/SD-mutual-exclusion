import pandas as pd;
import numpy as np;
import sqlite3 as sq;
import sys;
from sklearn.model_selection import train_test_split

conn = sq.connect('../clima.db')

cursor = conn.cursor()

data  = []
# criando a tabela (schema)
city  = sys.argv[1]
date1 = sys.argv[2]
date2 = sys.argv[3] 
parametros = sys.argv[4] + ' ,measure_date'


query = " SELECT " + parametros
query +=" FROM measurements_daily INNER JOIN weather_stations ON measurements_daily.weather_station_id = weather_stations.id "
query += ' WHERE weather_stations.name = "'+ city + '"'
query += ' and measurements_daily.measure_date > "'+ date1 +'"'
query += ' and measurements_daily.measure_date < "'+ date2+'"'

print(query)

cursor.execute(query)
rows = cursor.fetchall()
for tabela in rows:
    #print(tabela)
    data.append(tabela)

df = pd.DataFrame(data)
df.columns = parametros.split(',')

print(df.head())


'''
train_features, test_features, train_labels, test_labels = train_test_split(features, labels, test_size = 0.25, random_state = 42)

years = df['year']
months = df['month']
days = df['day']

# List and then convert to datetime object
dates = [str(int(year)) + '-' + str(int(month)) + '-' + str(int(day)) for year, month, day in zip(years, months, days)]
dates = [datetime.datetime.strptime(date, '%Y-%m-%d') for date in dates]
'''


df['Year']=[d.split('-')[0] for d in df.measure_date]
df['Month']=[d.split('-')[1] for d in df.measure_date]
df['Day']=[d.split('-')[2] for d in df.measure_date]

print(df.head())


    


