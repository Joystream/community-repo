using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Telegram.Bot;
using Telegram.Bot.Args;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums; //check on msg type
using Telegram.Bot.Types.ReplyMarkups;
using Telegram.Bot.Types.InlineQueryResults;
using System.Net;
using System.Net.Http;
using System.Data.SqlClient;

namespace ConsoleApp19
{
    class Program
    {
        static TelegramBotClient Bot;
      static  HttpClient client = new HttpClient();

        public static SqlConnection GetConnectionsString()
        {
            return new SqlConnection(@"{}"); //your sql connection string!!!

        }


        public static void SQLUpdate(string sql)  //insert or update. when nothing to return
        {

            SqlConnection sqlConnection = GetConnectionsString();

           try
            {
                sqlConnection.Open();

                SqlCommand myCommand = new SqlCommand(sql, sqlConnection);
                myCommand.ExecuteNonQuery();
                Console.WriteLine($"Executing {sql}");

            }
            catch (Exception e)
            {
                Console.WriteLine($"Error {e} while executing {sql}");
            }

        }

        public static object SQLGetData(string sql)  //when noeed to get a return
        {
            string result;
            SqlConnection sqlConnection = GetConnectionsString();


            sqlConnection.Open();
            SqlCommand myCommand = new SqlCommand(sql, sqlConnection);

            result = (string)myCommand.ExecuteScalar();


            if (result == "null")
            {
                Console.WriteLine("exeption");
            }
            return result;



        }


        public static string WelcomAndLog(Message msg)
        {


          
            string sql1 = $"IF EXISTS (SELECT * FROM info WHERE uid={msg.From.Id}) BEGIN UPDATE info SET chatid={msg.From.Id} WHERE uid={msg.From.Id} END ELSE BEGIN INSERT INTO info (uid,address,chatid,funded) VALUES ({msg.From.Id},'null',{msg.From.Id},'false') END ";
            SQLUpdate(sql1);

            //insert info of auth


            return "Welcome to Joystream Faucent. This bot will drop you 101 JOY. Due to hight load, please wait with patience until your que comes ";
        }


        public static string Helpmsg()
        {
            

            return "Contact Alx or try to start again. /start ";
        }


        public static void GetAddress(Message msg)
        {
             HttpClient client = new HttpClient();
 
            string sql1 = $"IF EXISTS (SELECT * FROM info WHERE uid={msg.From.Id} AND funded='false') BEGIN UPDATE info SET uid ={msg.From.Id}, address ='{msg.Text}'  WHERE chatid = { msg.From.Id } END                ELSE BEGIN INSERT INTO info(uid, address, chatid, funded)VALUES({ msg.From.Id},'null',{ msg.From.Id},'false') END ";       
            SQLUpdate(sql1);
            string api = "";// your tg api key

            string sql2 = $"SELECT funded FROM info WHERE uid={msg.From.Id}";
         string iffunded = SQLGetData(sql2).ToString();
        
            if (iffunded.Replace(" ","")=="true")
            {
                string rep = "You alread was funded. If mistake, contact Alx";
              var responseString = client.GetStringAsync("https://api.telegram.org/bot" + api + "/sendMessage?chat_id=" + msg.Chat.Id + "&text=" + rep);
            } else

            if (iffunded.Replace(" ", "") == "false")
            {
                string rep = "You are in que. You will get notified when funded.";
                var responseString = client.GetStringAsync("https://api.telegram.org/bot" + api + "/sendMessage?chat_id=" + msg.Chat.Id + "&text=" + rep);

            }
         
           





          





        }

        static void Main(string[] args)
        {


            Bot = new TelegramBotClient(""); //your api key

            Bot.OnMessage += BotOnMessageReceived; //subscribe on receiving msg

            Bot.StartReceiving(); // listening msg
            var me = Bot.GetMeAsync().Result;
            Console.ReadLine();
            Bot.StopReceiving();
        }

        private static async void BotOnMessageReceived(object sender, Telegram.Bot.Args.MessageEventArgs e)
        {

            var message = e.Message;
            if (message == null || message.Type != MessageType.Text) //check if not nul and text
            {
                return;
            }

            var MainKeboard = new ReplyKeyboardMarkup(
                   new KeyboardButton[][]
                   {
                        new KeyboardButton[] { "💰 Get 101 JOY" }

                   },
                   resizeKeyboard: true
               );

            var HelpKeyboard = new ReplyKeyboardMarkup(
                 new KeyboardButton[][]
                 {
                        new KeyboardButton[] { "🆘 Need help?" }

                 },
                 resizeKeyboard: true
             );

         
            Console.WriteLine($"{DateTime.Now:yyyy-MM-dd:hh-mm-ss} {message.Chat.Id} send msg = '{message.Text}'");

            try
            {

                if (message == null || message.Type != MessageType.Text) return;

                switch (message.Text)
                {
                    case "/start":
                        {




                            await Bot.SendTextMessageAsync(message.Chat.Id, WelcomAndLog(message), replyMarkup: MainKeboard);
                            break;

                        }

                    case "💰 Get 101 JOY":
                        {



                            await Bot.SendTextMessageAsync(message.Chat.Id, "Send your wallet address", replyMarkup:HelpKeyboard);
                            break;

                        }


                    case "🆘 Need help?":
                        {



                            await Bot.SendTextMessageAsync(message.Chat.Id, Helpmsg(), replyMarkup: HelpKeyboard);
                            break;

                        }






                }

                /*
                if (message.ReplyToMessage != null && message.ReplyToMessage.Text.Contains("Send your wallet address"))
                {
                    GetAddress(message);
                }
                */

                if (message.Text.Length==48)
                {
                    GetAddress(message);
                }
            }


            catch (Exception ex)
            {
                throw;
                Console.WriteLine("err");
                
               //await Bot.SendTextMessageAsync(message.Chat.Id, "Error. Please wait and /start again");
            }



        }
    }
}
