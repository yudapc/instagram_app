const ClientOAuth2 = require('client-oauth2');
const express = require('express');
const app = express();

const githubAuth = new ClientOAuth2({
  clientId: 'bee65bfe56f86d89a329',
  clientSecret: 'fd08d321ccbe6c778fd09318757f334849edbb38',
  accessTokenUri: 'https://github.com/login/oauth/access_token',
  authorizationUri: 'https://github.com/login/oauth/authorize',
  redirectUri: 'http://localhost:3000/auth/github/callback',
  scopes: ['notifications']
});

app.get('/', (req, res) => {
  const uri = githubAuth.code.getUri()
  res.redirect(uri)
});

app.get('/auth/github/callback', (req, res) => {
  githubAuth.code.getToken(req.originalUrl)
    .then((user) => {
      console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }

      // Refresh the current users access token.
      user.refresh().then((updatedUser)  => {
        console.log(updatedUser !== user) //=> true
        console.log(updatedUser.accessToken)
      });

      // Sign API requests on behalf of the current user.
      user.sign({
        method: 'get',
        url: 'http://localhost:3000'
      });

      // We should store the token into a database.
      return res.send('access_token= ' + user.accessToken);
    })
})

app.listen(3000, () => console.log('Hello Instagram run on port 3000!'));
