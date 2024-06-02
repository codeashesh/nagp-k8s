<a name="desc"></a>
## Content

-  [ Project Overview. ](#desc)
-  [ All Links. ](#code_link)
-  [ Project Structure. ](#structure)
-  [ Prerequisites. ](#prerequisites)
-  [ Project Setup. ](#usage)
    - [ GKE Setup. ](#gke_usage)
    - [ K8s Manifest Creation and Deployment. ](#resource_usage)
-  [ Testing the deployment. ](#test)
-  [ Ensure Data Persistence. ](#data_persist)
-  [ Show Rolling Update. ](#rolling_update)
-  [ Show Horizontal Pod Autoscaler in action. ](#hpa)
-  [ Project Architecture. ](#architecture)

<a name="desc"></a>
## Project Overview
This project demonstrates the deployment of a PostgreSQL database using StatefulSets and a Node.js API service using Deployment in a GKE (Google Kubernetes Engine) cluster.<br>
**Features:**<br>
1) The PostgreSQL database is deployed using Statefulsets.<br>
1.a) The database is only be accessible from inside the cluster and not outside the cluster.<br>
1.b) Number of database pods is 1.<br>
1.c) Data should be persisted in database, so if the pod goes down data should not be lost.<br>
1.d) All database configurations i.e., db name, user, port and password are provided through ConfigMaps and Secrets. <br>
2) The User API Service is deployed using Deployment to show rolling update.<br>
2.a) The Rest Endpoints in user service are accessible from outside the cluster.<br>
2.b) The Rest Endpoints can be used to retrieve, create and delete user records from the above database. The Rest Endpoints can be used to increase, decrease and stop load on user api service.<br>
2.c) A headless cluster IP service is used to connect to the database with host as **<database-service>.<namespace>.svc.cluster.local**. <br>
2.d) Number of user api service pods are 3. <br>
2.e) All configurations i.e., db host, db user, db port, db password and user service port are provided through ConfigMaps and Secrets. <br>
3) A Horizontal Pod Autoscaler (HPA) is configured on User API Service which will automatically increase/decrease the number of running pods depending on the CPU and Memory Utilization. <br>
4) General Rules:<br>
4.a) Node js is used to build the User API Service. <br>
4.b) K8s cluster is deployed on Google Cloud by enabling GKE Engine. <br>
4.c) Direct Pod IPs are not used for communication. Headless and Loadbalancer k8s services are used for communication.<br>
4.d) All configuration values are passed using K8s ConfigMaps.<br>
4.e) All secret info like password etc are passed using K8s Secrets. <br>

<a name="code_link"></a>
## All relevant project links:

1. Click [Here](https://github.com/codeashesh/nagp-k8s) to access the Code Repository on Gitlab.

2. User API Service Docker Image is pushed on Google Artifact Registry. Use these commands with the Docker client to pull the image. To use these commands, your Docker client must be configured to authenticate with gcr.io. If this is the first time that you are pulling an image from gcr.io with your Docker client, run the following command on the machine where Docker is installed.
```sh
gcloud auth configure-docker gcr.io
docker pull gcr.io/kubernetes-424218/user-service:v1
docker pull gcr.io/kubernetes-424218/user-service@sha256:2c939d0d964c48aba5271bb2894c7a0f19824d62c8c09fc65a7dfadfff3216b8
```
A screenshot of the user service docker image pushed at the GCR can be referenced [here](images/GCR_User_Service_Docker_Image.png).

3. User API Service External URLs to view the records from backend tier is:
```sh
curl http://34.31.79.96:80/api/user
```
User API service exposes several other endpoints which can be seen by the below command:
```sh
curl http://34.31.79.96:80
```
Below is the response from above endpoint:
```sh
Welcome to Ashesh Saraf Kubernetes & Docker NAGP Server.
Exposing the following endpoints:
1. POST /api/user (Create new user)
2. GET /api/user (Get all users)
3. DELETE /api/user (Delete all users)
4. GET api/load/user/start (Start Generating load in user service)
5. GET api/load/user/decrease (Decrease load in user service)
6. GET api/load/user/stop (Stop the load in user service)
```
4. A Demo Video showcasing everything can be found [here](). 

<a name="structure"></a>
## Project Structure
Workspace/<br>
├── k8s/<br>
├── │── namespace.yaml<br>
├── │── user/<br>
├── │── ├── user-config.yaml<br>
├── ├── ├── user-secret.yaml<br>
├── ├── ├── database/<br>
├── ├── ├── ├── user-db-pv.yaml<br>
├── ├── ├── ├── user-db.yaml<br>
├── ├── ├── ├── user-db-service.yaml<br>
├── ├── ├── user-service.yaml<br>
├── ├── ├── hpa/<br>
├── ├── ├── ├── user-service-hpa.yaml<br>
├── services/<br>
├── ├── user/<br>
├── ├── ├── controller/<br>
├── ├── ├── ├── userController.js<br>
├── ├── ├── ├── loadController.js<br>
├── ├── ├── service/<br>
├── ├── ├── ├── initializeDbService.js<br>
├── ├── ├── ├── userService.js<br>
├── ├── ├── ├── loadService.js<br>
├── ├── ├── db/<br>
├── ├── ├── ├── userDb.js<br>
├── ├── ├── server.js<br>
├── ├── ├── Dockerfile<br>
├── ├── ├── package.json<br>
├── README.md<br>

<a name="prerequisites"></a>
## Prerequisites
1. Google Cloud SDK installed and configured.
2. `kubectl` command-line tool installed.
3. Docker installed and configured.
4. Node.js and npm installed.
5. Postman or any other tool to access the Rest APIs.

<a name="usage"></a>
## Project Setup

<a name="gke_usage"></a>
### 1. GKE Setup

#### 1.1) Login to your Google Cloud Account using the below command in Google Cloud SDK Shell
```sh
gcloud auth login
```

#### 1.2) Create the GKE Cluster. Here the name of cluster is **nagp-k8s-cluster** which have 2 nodes and is created in zone us-central1-a.
```sh
gcloud container clusters create nagp-k8s-cluster --num-nodes=2 --zone=us-central1-a
```
Cluster can be deleted as well using the below command:
```sh
gcloud container clusters delete nagp-k8s-cluster --zone us-central1-a
```

#### 1.3) Create and describe a compute disk in the same zone
```sh
gcloud compute disks create nagp-k8s-persistent-disk --size=10GB --zone=us-central1-a 
gcloud compute disks describe nagp-k8s-persistent-disk --zone=us-central1-a
```
Disk can be deleted as well using the below command:
```sh
gcloud compute disks delete nagp-k8s-persistent-disk --zone=us-central1-a
```

<a name="resource_usage"></a>
### 2. K8s Manifest Creation and Deployment

#### 2.1) Create a [namespace](k8s/namespace.yaml). Here "nagp-k8s" namespace is created to organize all the resource created for this project. 
```sh
kubectl apply -f k8s/namespace.yaml
```

#### 2.2) Create [ConfigMaps](k8s/user/user-config.yaml) and [Secrets](k8s/user/user-secret.yaml) for Database and Service Configurations
```sh
kubectl apply -f k8s/user/user-config.yaml
kubectl apply -f k8s/user/user-secret.yaml
```

#### 2.3) Deploy PostgreSQL Database using StatefulSets

##### 2.3.1) Create a **[Persistent Volume (PV)](k8s/user/database/user-db-pv.yaml)** by referencing the disk created in step 1.3
```sh
kubectl apply -f k8s/user/database/user-db-pv.yaml
```

##### 2.3.2) Create **[StatefulSet](k8s/user/database/user-db.yaml)** for PostgreSQL
```sh
kubectl apply -f k8s/user/database/user-db.yaml
```

##### 2.3.3) Create a **[service](k8s/user/database/user-db-service.yaml)** to access PostgreSQL from within the cluster
```sh
kubectl apply -f k8s/user/database/user-db-service.yaml
```

##### 2.3.4) **Verify** the statefulsets, service, persistent volume and persistent volume claim are created
```sh
kubectl get pv -n nagp-k8s
kubectl get pvc -n nagp-k8s
kubectl get statefulsets -n nagp-k8s
kubectl get services -n nagp-k8s
kubectl get pods -n nagp-k8s
```

#### 2.4) Deploy Node js api service having 3 replicas using deployment which will interact with the statefulset database deployed in step 2.3

##### 2.4.1) Enable Google Artifact Registry on the GCP.

##### 2.4.2) Login to connect to the Google Artifact Registry.
```sh
gcloud auth configure-docker gcr.io
gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://gcr.io
```

##### 2.4.3) Build and Push user service docker image on Google Artifact Registry using the [Dockerfile](services/user/Dockerfile) created for user service.
```sh
docker build -t user-service ./services/user
docker tag user-service gcr.io/kubernetes-424218/user-service:v1
docker push gcr.io/kubernetes-424218/user-service:v1
```

##### 2.4.4) Create [Deployment and Loadbalancer Service](k8s/user/user-service.yaml) for User Service. The user service will be exposed outside the cluster through the load balancer service and will connect to the database using the host **<database-service>.<namespace>.svc.cluster.local**.
```sh
kubectl apply -f k8s/user/user-service.yaml
```

##### 2.4.5) Verify user service deployment
```sh
kubectl get deployment -n nagp-k8s
kubectl get service -n nagp-k8s
kubectl get pods -n nagp-k8s
```

##### 2.4.6) The external IP address of the load balancer service will appear which can be used to access the user service from outside the cluster. Verify the IP to know the service is running properly. 
```sh
curl http://34.31.79.96:80
```

#### 2.5) Deploy [Horizontal Pod Autoscaler](k8s/user/hpa/user-service-hpa.yaml) for user service
```sh
kubectl apply -f k8s/user/hpa/user-service-hpa.yaml
```

<a name="test"></a>
## Testing the deployment

### 1. Verify deployment. Screenshot of the response can be refrenced [here](images/all_deployment.png).
```sh
kubectl get all -n nagp-k8s
```

### 2. Testing the user service endpoints

#### 2.1) Navigate to the Kubernetes Engine through [Google Console](https://console.cloud.google.com/) and open Workloads to see all the objects are created and running properly. 

#### 2.2) The postgresql database pod should be in running status with Cluster IP service exposing the database pod. Screenshot can be refrenced [here](images/gke_db_statefulsets_details.png).

#### 2.3) There must be 3 user api service pods in running status with Loadbalancer service exposing the user service pod through External IP. Screenshot can be refrenced [here](images/gke_user_api_service_details.png).

#### 2.4) Save a user. Screenshot of the response can be refrenced [here](images/save_user_curl.png).
```sh
curl -X POST -H "Content-Type: application/json" -d '{"name": "Ashesh Saraf","email": "ashesh.sarraf@nagarro.com"}'  http://34.31.79.96:80/api/user
```

#### 2.5) Fetch all users. Screenshot of the response can be refrenced [here](images/fetch_all_users_curl.png).
```sh
curl http://34.31.79.96:80/api/user
```

<a name="data_persist"></a>
## Ensure Data Persistence

### 1. Delete and recreate the PostgreSQL pod
```sh
kubectl delete pods user-db-0 -n nagp-k8s
```

### 2. Verify the PostgreSQL pod is recreated. Screenshot of delete and auto start of user-db pod can be refrenced [here](images/user_db_pod_deleted.png).
```sh
kubectl get pods -n nagp-k8s
```

### 3. Verify data is still present by fetching users. Screenshot of data being persisted can be refrenced [here](images/data_persists.png).
```sh
curl http://34.31.79.96:80/api/user
```

<a name="rolling_update"></a>
## Show Rolling Update

### 1. Build user service docker image with v2 tag and push it on Google Artifact Registry.
```sh
cd services/user-service
docker build -t user-service .
docker tag user-service gcr.io/kubernetes-424218/user-service:v2
docker push gcr.io/kubernetes-424218/user-service:v2
```

### 2. Update the user service docker image version in user-service.yaml and apply changes
```sh
kubectl set image deployment/user-service user-service=gcr.io/kubernetes-424218/user-service:v2 -n nagp-k8s
```

### 3. Verify rolling update by observing new pods gets created 1 by 1 and old pods gets deleted 1 by 1. Screenshot of rolling update can be refrenced [here](images/rolling_update.png).
```sh
kubectl get pods -n nagp-k8s
```

<a name="hpa"></a>
## Show Horizontal Pod Autoscaler in action

### 1. Start load generation to increase the CPU utilization and memory
```sh
curl http://34.31.79.96:80/api/load/user/start?duration=120000&step=500
```

### 2. Monitor HPA. The number of pods will gradually increase when the threshold will be crossed and will gradually decrease when load decreases. Screenshot of load increase leading to increase in number of pods can be refrenced [here](images/hpa_load_increase.png) and screenshot of load decrease leading to decrease in number of pods can be refrenced [here](images/hpa_load_decrease.png).
```sh
kubectl get hpa -n nagp-k8s
kubectl top pods -n nagp-k8s
```

### 3. Verify data is still present by fetching users.
```sh
curl http://34.31.79.96:80/api/user
```

<a name="architecture"></a>
## Project Architecture:
<pre>
+------------------------------------+
|   GKE Cluster: nagp-k8s-cluster    |
|  +-----------------------------+   |
|  |      Namespace: nagp-k8s    |   |
|  |  +-----------------------+  |   |
|  |  |  StatefulSet: user-db |  |   |
|  |  |  +------------------+ |  |   |
|  |  |  | Pod: user-db-0   | |  |   |
|  |  |  +------------------+ |  |   |
|  |  |  +------+ +--------+  |  |   |
|  |  |  | PVC  | |  PV    |  |  |   |
|  |  |  +------+ +--------+  |  |   |
|  |  |  +----------++------+ |  |   |
|  |  |  |ConfigMap ||Secret| |  |   |
|  |  |  +----------++------+ |  |   |
|  |  +-----------------------+  |   |
|  |  +-----------------------+  |   |
|  |  |      Deployment:      |  |   |
|  |  |     user-service      |  |   |
|  |  |  +------------------+ |  |   |
|  |  |  | Pod:user-service | |  |   |
|  |  |  | Pod:user-service | |  |   |
|  |  |  | Pod:user-service | |  |   |
|  |  |  +------------------+ |  |   |
|  |  |  +----------+ +------+|  |   |
|  |  |  |ConfigMap | |Secret||  |   |
|  |  |  +----------+ +------+|  |   |
|  |  +-----------------------+  |   |
|  |  +-----------------------+  |   |
|  |  |Service: user-service  |  |   |
|  |  | +-------------------+ |  |   |
|  |  | |   LoadBalancer    | |  |   |
|  |  | +-------------------+ |  |   |
|  |  +-----------------------+  |   |
|  |  +-----------------------+  |   |
|  |  |   HPA: user-service   |  |   |
|  |  +-----------------------+  |   |
|  +-----------------------------+   |
+------------------------------------+
</pre>