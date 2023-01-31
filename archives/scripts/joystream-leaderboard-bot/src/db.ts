import mongoose from 'mongoose';

export interface IMember extends mongoose.Document {
  handle?: String,
  tgId?: Number,
  enableNotify?: number,
  disId?: Number,
  date?: number,
  lastCommand: String,
  lastCommandChatId?: Number,
};

const memberSchema = new mongoose.Schema({
  handle: String,
  tgId: Number,
  enableNotify: Number,
  disId: Number,
  date: Number,
  lastCommand: String,
  lastCommandChatId: Number,
});

export interface IFaucet extends mongoose.Document {
  handle?: String,
  tgId?: Number,
  disId?: Number,
  date?: number,
  dateLastOperation?: number;
  addresses?: Array<string>,
};

const faucetSchema = new mongoose.Schema({
  handle: String,
  tgId: Number,
  disId: Number,
  date: Number,
  dateLastOperation: Number,
  addresses: [String],
});

export const MemberModel = mongoose.model<IMember>('members', memberSchema);
export const FaucetModel = mongoose.model<IFaucet>('faucet', faucetSchema);

const dbString = 'mongodb://127.0.0.1:27017/JoystreamLeaderboardBotTest';

export default () => {
  const connect = () => {
    mongoose
      .connect(
        dbString,
        { useNewUrlParser: true, useUnifiedTopology: true }
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