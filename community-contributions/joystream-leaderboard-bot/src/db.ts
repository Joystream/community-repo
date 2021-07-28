import mongoose from 'mongoose';

export interface IMember extends mongoose.Document {
  handle?: String,
  tgId?: Number,
  disId?: Number,
  date?: number,
  lastCommand: String
};

const memberSchema = new mongoose.Schema({
  handle: String,
  tgId: Number,
  disId: Number,
  date: Date,
  lastCommand: String
});

export const MemberModel = mongoose.model<IMember>('members', memberSchema);

const dbString = 'mongodb://127.0.0.1:27017/JoystreamLeaderboardBotTest';

export default () => {
  const connect = () => {
    mongoose
      .connect(
        dbString,
        { useNewUrlParser: true }
      )
      .then(() => {
        return console.info(`Successfully connected to ${dbString}`);
      })
      .catch(error => {
        console.error('Error connecting to database: ', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
}
