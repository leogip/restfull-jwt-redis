# Express + JWT + Redis RESTFull Api

### Install dependencies and start Redis server

Before start project you should install all dependencies. Install on server(computer) redis-server and start him

### Write in environment data

create .env file with your environment data
Data in file .env.example

In the project directory, you can run:

### `yarn dev`

or

### `npm run dev`

Runs the server in the development mode.
[http://localhost:5000](http://localhost:5000)

## Authorization and Authentication

POST
[http://localhost:5000/api/auth/registration](http://localhost:5000/api/auth/registration)

```
{
	"email": "email@email.com",
	"firstname": "Name",
	"lastname": "Lastname",
	"password": "Qq12345"
}
```

GET
[http://localhost:5000/api/auth/confirm/confirm-token](http://localhost:5000/api/auth/confirm/${confirm-token})

```
{
"success": {
    "message": message
},
"statusCode": code
}
```

POST
[http://localhost:5000/api/auth/resend](http://localhost:5000/api/auth/resend)

```
{
	"email": "email@email.com"
}
```

POST
[http://localhost:5000/api/auth/login](http://localhost:5000/api/auth/login)

```
{
	"email": "email@email.com",
	"password": "Qq12345"
}
```

POST
[http://localhost:5000/api/auth/recover](http://localhost:5000/api/auth/recover)

```
{
	"email": "email@email.com"
}
```

POST
[http://localhost:5000/api/auth/reset/token](http://localhost:5000/api/auth/reset/${token})

```
{
	"email": "email@email.com",
	"password": "12345Qq"
}
```

POST / TOKEN
[http://localhost:5000/api/auth/verify](http://localhost:5000/api/auth/verify)

POST / TOKEN
[http://localhost:5000/api/auth/logout](http://localhost:5000/api/auth/logout)

## USER

GET / TOKEN
[http://localhost:5000/api/user/current](http://localhost:5000/api/user/current)

GET / TOKEN
[http://localhost:5000/api/user/id](http://localhost:5000/api/user/${id))

PUT / TOKEN
[http://localhost:5000/api/user/id](http://localhost:5000/api/user/${id})

```
{
	"email": "email@email.com",
	"firstname": "NameNew",
	"lastname": "LastnameNew",
	"password": "Qq12345"
}
```

DELETE / TOKEN
[http://localhost:5000/api/user/id](http://localhost:5000/api/user/${id})
