# API list

## authRouter

- POST /signup
- POST /login
- POST /logout

## profileRouter

- GET /profile/view
- GET /profile/edit
- GET /profile/password

## connectRequestRouter

- POST /request/send/:status/:userId
- POST /request/review/:status/:requestId

# userRouter

- GET /user/connections
- GET /user/request
- GET /user/feed - gets you the profile of other users on platform

Status: ignore, interested, accepted, rejected
