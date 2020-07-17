const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
// ... manage URL of mongo-atlas db (from cluster) *sended to env*
// connect that mongoose with Mongo cluster

// console.log(db_uri);
prod_db = process.env.DB_URI,
test_db = process.env.DB_TEST,

mongoose.connect(
  prod_db, 
  // test_db,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (!err) {
      console.log("MongoDB - Conexion exitosa :):");
    } else {
      console.log(`Error en conexion: \n ${err}`);
    }
  }
);
