
app.get('/hello.html', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <h1>Hello World!</h1>
        <p>If you see this, your server is working correctly.</p>
    </body>
    </html>
  `);
});