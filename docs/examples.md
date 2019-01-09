

# [« Home](https://graphy.link/) / Examples

## Contents
 - [Validate Turtle documents](#validate-turtle)


<a name="validate-turtle" />

### [Validate Turtle Documents](#validate-turtle)
In this simple example, we demonstrate how to validate Turtle sent to a mock Node.js web server using [Express](https://expressjs.com/).

```js
const app = require('express')();
const ttl_read = require('@graphy/content.ttl.read');

app.post('/validate', (ds_req, ds_res) => {
	ds_req.pipe(ttl_read({
		validate: true,
	}))
		.on('error', (e_read) => {
			ds_res.status(400).end(`Invalid Turtle document: ${e_read.message}`);
		})
		.on('eof', () => {
			ds_res.status(200).end('Valid Turtle!');
		});
});

app.listen(3210);
```

#### Testing with invalid input:
```bash
$ curl -X POST --data "<This> <is> <bad input>." http://localhost:3210/validate
```

#### Prints:
```
Invalid Turtle document: invalid IRI: "bad input"
```

#### Testing with valid input:
```bash
$ echo "
	@prefix : <http://ex.org/> .
	:This :is :Good_Input .
" | curl -X POST --data @- http://localhost:3210/validate
```

#### Prints:
```
Valid Turtle!
```
