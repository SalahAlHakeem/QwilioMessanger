import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import profileRouter from './routes/profileRouter';
import groupRouter from './routes/groupRouter';
import dotenv from 'dotenv';
import chatRouter from './routes/chatRouter';
import messageRouter from './routes/messageRouter';
import individualRouter from './routes/individualRouter';
import fs from 'fs/promises'


async function main() {
  dotenv.config();

  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  const app = express();
  app.use(cors());
  app.use(express.json({limit: '50mb'}));
  app.use(express.urlencoded({ extended: true, limit: '50mb'}));

  app.use('/profile', profileRouter);
  app.use('/group', groupRouter);
  app.use('/chat', chatRouter);
  app.use('/message', messageRouter);
  app.use('/individual', individualRouter);

  app.use((err, req, res, next) => {
    fs.writeFile('./logger.txt', JSON.stringify(err));
    res.status(500).send('Something went wrong!');
  });

  if (process.env.PORT) {
    app.listen(process.env.PORT, () => {console.log(`server is running on port ${process.env.PORT}`)});
  }
}

main();


