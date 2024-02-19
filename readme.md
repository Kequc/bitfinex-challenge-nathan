# Setup

```
npm i -g grenache-grape
npm i
```

```
# boot two grape servers

grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

# or

npm script run dev
```

# Usage

```
npm start
```

This starts a simple line reader application which accepts the following commands:

```
create [port]
disconnect [port]
order [port] [buy/sell] [asset] [price] [quantity]
orderbook [port]
exit
```

## create [port]

Create a client at the given port recommended 1025, 1026, etc.

## disconnect [port]

Disconnect a client

## order [port] [buy/sell] [asset] [price] [quantity]

Places an order by the given client eg.

```
order 1025 buy btc 100 1
```

## orderbook

View the orderbook of the given client

## exit

Closes the application

# Example

```
npm start

create 1025
create 1026

order 1025 buy btc 100 1
order 1025 sell btc 110 1
order 1025 buy btc 120 1
order 1026 sell btc 100 1
order 1026 buy eth 110 1
order 1026 buy btc 120 1

orderbook 1025
exit
```
