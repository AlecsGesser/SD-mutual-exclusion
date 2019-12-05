import pandas as pd;
import numpy as np;
import sqlite3 as sq;
import sys;
from sklearn.model_selection import train_test_split
import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn import metrics, preprocessing
from sklearn.linear_model import LinearRegression
from flask import Flask, jsonify,render_template, request
from flask_socketio import SocketIO
import time



def pre_process_data( a,b,c,d ):
    time.sleep(2)
    #-----------------------------------------------GETTING DATA FROM DATABASE---------------------------------------------------

    conn = sq.connect('../clima.db')
    cursor = conn.cursor()
 

    city  = a
    date1 = b
    date2 = c
    predict =' "'+ d+'" '


    query = " SELECT * "
    query +=" FROM measurements_daily INNER JOIN weather_stations ON measurements_daily.weather_station_id = weather_stations.id "
    query += ' WHERE weather_stations.name LIKE "'+ city + '"'
    query += ' and measurements_daily.measure_date > "'+ date1 +'"'
    query += ' and measurements_daily.measure_date < "'+ date2+'"'


    df = pd.read_sql_query(query, conn)

    #-----------------------------------------------PREPROCESSING DATA-------------------------

    #-----------------------------------------------SPLITING DATE INTO NEW COLUMNS-------------

    df['year']=[d.split('-')[0] for d in df.measure_date]
    df['month']=[d.split('-')[1] for d in df.measure_date]
    df['day']=[d.split('-')[2] for d in df.measure_date]
    df['utf_hour'] = [ datetime.datetime.strptime(d,  '%Y-%m-%d %H:%M:%S.%f').time().hour for d in df.utf_hour ]
    
    #-----------------------------------------------DROPING UNUSEFUL DATA---------------------------   
    d = list(set(df.columns.values) & set(['measure_date', 'weather_station_id', 'id', 'name', 'province', 'omm', 'inmet_id', 'measure_date_complete']))
    df = df.drop(d, axis=1)

    #-----------------------------------------------FILLING NULL DATA---------------------------

    df = df.groupby(df.columns, axis = 1).transform(lambda x: x.fillna(x.mean()))
    df = df.fillna(0)


    #-----------------------------------------------CONVERT DATA---------------------------
    df = df.transform( lambda x: pd.to_numeric(x, downcast='float'))

    return df

def run_RandomForest(df, predict):
    y = df[predict]
    X = df.drop(predict, axis=1)

    rotulos = X.columns.values
    #-----------------------------------------------SPLITING DATA---------------------------------------------------

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3) # 70% TO TRAINNING 30% TO TEST

    lab_enc = preprocessing.LabelEncoder()
    y_train = lab_enc.fit_transform(y_train)
    y_test = lab_enc.fit_transform(y_test)


    clf=RandomForestClassifier(n_estimators=100)
    clf.fit(X_train,y_train)
    y_pred=clf.predict(X_test)
    #-----------------------------------------------SHOWING RESULTS---------------------------------------------------

    print("Accuracy RandomForest:",metrics.accuracy_score(y_test, y_pred))
    print(len(rotulos))

    #-----------------------------------------------CREATING OUTPUT DATA---------------------------------------------------
    feature_imp = pd.Series(clf.feature_importances_, index = rotulos).sort_values(ascending=False).to_json()

    print(feature_imp)
    return feature_imp

app = Flask(__name__)


@app.route('/server', methods=['GET','POST'])
def test():
    if request.method == "POST":
        df = pre_process_data( request.json['data']['city'], request.json['data']['start'], request.json['data']['end'], request.json['data']['parameter'] )
        print(df.head())
        a = run_RandomForest(df, request.json['data']['parameter'])
        return a
        

if __name__ == "__main__":
    app.run(debug=True)









