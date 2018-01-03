const express = require('express');
const oauth2 = require('simple-oauth2').create(credentials);
const app = express();

const credentials = {
  client: {
    id: '47c4cf2b2ad94fd4866ddc7df9a2cfb0',
    secret: '6c8d15e8badf48709db574b58b84339f'
  },
  auth: {
    tokenHost: 'https://api.instagram.com',
    tokenPath: '/oauth/access_token',
    authorizePath: '/oauth/authorize',
  }
};

const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/auth',
  response_type: 'code',
});

app.get('/', (req, res) => {
  res.redirect(authorizationUri);
});

app.get('/auth', (req, res) => {
  const code = req.query.code;

  const options = {
    code,
    redirect_uri: 'http://localhost:3000/auth'
  };

  oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error) {
      console.error('Access Token Error', error.message);
      return res.json('Authentication failed');
    }

    console.log('The resulting token: ', result);
    const token = oauth2.accessToken.create(result);

    return res
      .status(200)
      .json(token);
  });
});

app.listen(3000, () => console.log('Hello Instagram run on port 3000!'));
