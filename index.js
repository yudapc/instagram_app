const express = require('express');
const session = require('express-session');
const request = require('request');
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

const oauth2 = require('simple-oauth2').create(credentials);

const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/auth',
  response_type: 'code',
  scope: ['users', 'relationships', 'media', 'comments', 'likes', 'follower_list', 'public_content'],
  state: 'a state',
});

app.use(session({secret: "zzz, ini rahasia bang9et!"}));

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
    req.session.accessToken = result.access_token;
    req.session.userId = result.user.id;

    return res
      .status(200)
      .json({ success: true });
  });

  app.get('/status', (req, res) => {
    console.log('session: ', req.session.accessToken);
    res.send('access_token = ' + req.session.accessToken);
  });

  app.get('/profile', (req, res) => {
    const access_token = req.session.accessToken;
    const uri = 'https://api.instagram.com/v1/users/self';
    request({
      uri,
      qs: {
        access_token,
      }
    }).pipe(res);
  });

  app.get('/media', (req, res) => {
    const access_token = req.session.accessToken;
    const userId = req.session.userId;
    const uri = `https://api.instagram.com/v1/users/${userId}/media/recent/`;
    request({
      uri,
      qs: {
        access_token,
      }
    }).pipe(res);
  });

  app.get('/follower', (req, res) => {
    const access_token = req.session.accessToken;
    const uri = 'https://api.instagram.com/v1/users/self/followed-by';
    request({
      uri,
      qs: {
        access_token,
      }
    }).pipe(res);
  });

  app.get('/following', (req, res) => {
    const access_token = req.session.accessToken;
    const uri = 'https://api.instagram.com/v1/users/self/follows';
    request({
      uri,
      qs: {
        access_token,
      }
    }).pipe(res);
  });

  app.get('/tag/:tag', (req, res) => {
    const access_token = req.session.accessToken;
    const userId = req.session.userId;
    const tag = req.params.tag;
    const uri = `https://api.instagram.com/v1/tags/${tag}/media/recent`;
    request({
      uri,
      qs: {
        access_token,
      }
    }).pipe(res);
  });
});

app.listen(3000, () => console.log('Hello Instagram run on port 3000!'));
