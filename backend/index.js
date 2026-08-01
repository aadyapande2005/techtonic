import connectdb from './config/db.js'
import {app} from './app.js'


connectdb()
.then(() => {
    app.listen(3000, () => {
        console.log("Server listening on port 3000");
    })
})
.catch(error => {
    console.log(error);
})


