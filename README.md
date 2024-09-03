# Clickstream Nodejs App based on Kafka, Sqlite & Docker

## Introduction
This is a clickstream app based on Nodejs, *Sqlite* & Apache Kafka. The app records events like `add to cart`, `delete item from cart` etc. We have docker-compose to run the application locally.

## Application Architecture

<img width="1070" alt="Screenshot 2024-09-03 at 12 04 43 PM" src="https://github.com/user-attachments/assets/ccf1736c-55a3-4d29-9264-9f17e3ff7d95">


## Features

1. Click streaming for multiple apis
2. Co-partitioned topics for Kafka Streaming (`Work in progress`)
3. Sqlite to persist DB with mount volumes
4. JWT authentication
5. Docker-compose to run the application
6. E-commerce APIs like Login, Add To cart / delete, Checkout, Order Placed, Shipping


## Tech stack

- Nodejs
- Sqlite3
- Docker & docker-compose
- Kafka cli
- Sqlite cli

## Postman Collection (Public)
```
https://www.postman.com/galactic-eclipse-361945/workspace/raptor9372/collection/1877749-0652fb9c-cd1d-4f1b-a822-8928d3f62119?action=share&creator=1877749
```
## Database ERD

<img width="1204" alt="Screenshot 2024-09-03 at 11 51 14 AM" src="https://github.com/user-attachments/assets/fa2c1642-323c-4c3e-9aa6-fd407d4073b8">

## API Endpoints

The base URL for the application that runs with docker is ```localhost:5001```. The port 5000 is sometimes occupied in macos.

|API| Endpoint  |
|--|--| 
| Login |  `POST localhost:5001/public/authenticate`
|   Add Product|  `POST {{base-url}}/cart/add`
|   Get Cart Items|  `GET {{base-url}}/cart`
|   Checkout | `POST {{base-url}}/cart/checkout/:cartId`
|   Create Order|  `POST {{base-url}}/orders/create`
|   Get Order| `GET {{base-url}}/orders/:orderId`
|   Delete Cart Item|  `DELETE {{base-url}}/cart/delete/:cartItemId`

## Run Application locally

1. Clone repository

```bash
  git clone git@github.com:amol9372/click-stream-app.git
```

2. Install Sqlite client or cli in your local machine

3. In the `docker-compose.yaml` file, change the path for  mount volumes for nodejs `app` service. Add the path to db folder which contains reference data & db file.

``` yaml
volumes:
- <path>/db:/usr/src/app/db 
 ```

4. Run the docker-compose commands 

```bash
> docker-compose build
> docker-compose up
```

## Onboarding

Import above postman collection to hit the apis.

The postman collection has variables for `token` & `base-url` to facilitate api testing. Once a login is successful, a token is generated & saved in postman collection variables to be used in all other APIs.

### How to place an order

In order to place an order hit the APIs in below order:

<img width="1290" alt="Screenshot 2024-09-03 at 12 57 53 PM" src="https://github.com/user-attachments/assets/d4b9ae21-3b84-4c34-a686-cfed8a24f546">


## Kafka 

Make sure you have installed `kafka cli tools` in your local system. 
Once installed, we need to verify events are published to the topic or not

- List of topics 

```bash
kafka-topics --bootstrap-server localhost:9092 --list
```

- Consume data from a particular topic

```bash
kafka-console-consumer --bootstrap-server localhost:9092 --topic click_stream_auth --from-beginning --property print.key=true
```

