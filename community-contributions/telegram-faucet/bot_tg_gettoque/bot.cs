  
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
            return new SqlConnection(@"");//conn string

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


           
            string sql12 = $"select address from info where uid={msg.Chat.Id} ";
            var iff1 = SQLGetData(sql12);
            string exampleTrimmed = "";
            if (iff1!=null)
            {

            
             exampleTrimmed = String.Concat(iff1.ToString().Where(c => !Char.IsWhiteSpace(c)));

            }


            if (exampleTrimmed != "abuse")
            {





                string sql1 = $"IF EXISTS (SELECT * FROM info WHERE uid={msg.From.Id} and (funded='true' or funded='false') ) BEGIN UPDATE info SET chatid={msg.From.Id} WHERE uid={msg.From.Id} END ELSE BEGIN INSERT INTO info (uid,address,chatid,funded) VALUES ({msg.From.Id},'null',{msg.From.Id},'false') END ";
                SQLUpdate(sql1);






                //insert info of auth


                return "Welcome to Joystream Faucent. This bot will drop you 101 JOY. Due to hight load, please wait with patience until your que comes ";


            }
            else return "Abuse detected";



        }


        public static string Helpmsg()
        {
            

            return "Contact @segoan or try to start again. /start ";
        }


        public static void GetAddress(Message msg)
        {
             HttpClient client = new HttpClient();

            string sqlcehck = $"select uid from info where address='{msg.Text}'";
            var iff = SQLGetData(sqlcehck);
            string api = ""; //yourapi

            string sqlcehck1 = $"select funded from info where uid='{msg.Chat.Id}'";
            var iff1 = SQLGetData(sqlcehck1);





            if (iff==null && iff1.ToString()!= "abuse")
            {





            string sql1 = $"IF EXISTS (SELECT * FROM info WHERE uid={msg.From.Id} AND funded='false' and funded !='abuse' ) BEGIN UPDATE info SET uid ={msg.From.Id}, address ='{msg.Text}'  WHERE chatid = {msg.From.Id} END             ";       
            SQLUpdate(sql1);

            string sql2 = $"SELECT funded FROM info WHERE uid={msg.From.Id}";

         string iffunded = SQLGetData(sql2).ToString();
        
            if (iffunded.Replace(" ","")=="true")
            {
                string rep = "You already was funded. If mistake, contact @segoan";
              var responseString = client.GetStringAsync("https://api.telegram.org/bot" + api + "/sendMessage?chat_id=" + msg.Chat.Id + "&text=" + rep);
            } else

            if (iffunded.Replace(" ", "") == "false")
            {
                string rep = "You are in que. You will get notified when funded.";
                var responseString = client.GetStringAsync("https://api.telegram.org/bot" + api + "/sendMessage?chat_id=" + msg.Chat.Id + "&text=" + rep);

            }





                var match = addresesinque
          .FirstOrDefault(stringToCheck => stringToCheck.Contains(msg.Chat.Id.ToString()));
                var match2 = fundedaddreses
         .FirstOrDefault(stringToCheck => stringToCheck.Contains(msg.Chat.Id.ToString()));
                if (match == null && match2 == null)
                {
                    System.IO.File.AppendAllText(allinfo, msg.Text + ";" + msg.Chat.Id + Environment.NewLine);
                    using (StreamWriter streamWriter = new StreamWriter(pathaddresestofund, true)) // the true will make you append to the file instead of overwriting its contents
                    {
                        streamWriter.Write(msg.Text + Environment.NewLine);
                    }
                    string rep = "You are in que. You will get notified when funded.";
                    var responseString =client.GetStringAsync("https://api.telegram.org/bot" + api + "/sendMessage?chat_id=" + msg.Chat.Id + "&text=" + rep);
                }
                else
                if (match != null || match2 != null)
                {
                    string rep = "You alread was funded or in a que. Please wait. If mistake, contact Alx";
                    var responseString = client.GetStringAsync("https://api.telegram.org/bot" + api + "/sendMessage?chat_id=" + msg.Chat.Id + "&text=" + rep);
                }
                */

            }
            else
            {
                string rep = "Abusing is leading to ban";

                string sql1 = $"UPDATE info SET funded='abuse',address='abuse' WHERE uid={msg.From.Id}";
                SQLUpdate(sql1);


                var responseString = client.GetStringAsync("https://api.telegram.org/bot" + api + "/sendMessage?chat_id=" + msg.Chat.Id + "&text=" + rep);

                Console.WriteLine("abuse");

            }




        }

        static void Main(string[] args)
        {


            Bot = new TelegramBotClient(""); //api

            Bot.OnMessage += BotOnMessageReceived; //subscribe on receiving msg

            Bot.StartReceiving(); // listening msg
            var me = Bot.GetMeAsync().Result;
            Console.ReadLine();
            Bot.StopReceiving();
        }

        private static async void BotOnMessageReceived(object sender, Telegram.Bot.Args.MessageEventArgs e)
        {

            var message = e.Message;
            Console.WriteLine($"{message.Chat.Id} send {message.Text}");
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

                            //check if number is exist and if start then change to false



                            await Bot.SendTextMessageAsync(message.Chat.Id, WelcomAndLog(message), replyMarkup: MainKeboard);
                            break;

                        }

                    case "💰 Get 101 JOY":
                        {

                            //check if number is exist and if start then change to false


                            await Bot.SendTextMessageAsync(message.Chat.Id, "Send your wallet address", replyMarkup:HelpKeyboard);
                            break;

                        }


                    case "🆘 Need help?":
                        {

                            //check if number is exist and if start then change to false


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
                //throw;
                Console.WriteLine("err");
                
               //await Bot.SendTextMessageAsync(message.Chat.Id, "Error. Please wait and /start again");
            }



        }
    }
}
