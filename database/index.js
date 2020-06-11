const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
// ... manage URL of mongo-atlas db (from cluster) *sended to env*
// connect that mongoose with Mongo cluster

// console.log(db_uri);
// process.env.DB_URI,
// process.env.DB_TEST,
mongoose.connect(
  process.env.DB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (!err) {
      console.log("MongoDB - Conexion exitosa :):");
    } else {
      console.log(`Error en conexion: \n ${err}`);
    }
  }
);
