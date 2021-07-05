sing OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Threading;

namespace ConsoleApp18
{
    class Program

    {
        static HttpClient client = new HttpClient();

        public static SqlConnection GetConnectionsString()
        {
            return new SqlConnection(@""); //connection string

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



        public static void Notifier(string chatid)
        {
            string api = //api key gor notify

            string rep = "You got funded!";
            var responseString = client.GetStringAsync("https://api.telegram.org/bot" + api + "/sendMessage?chat_id=" + chatid + "&text=" + rep);
            //function to send

        }







        public static void Browsersender(string pass,string amount)
        {

           







            ChromeOptions options = new ChromeOptions();
            options.AddArguments("--lang=en");

            ChromeDriver driver = new ChromeDriver(@"", options);//you crominium option

            driver.Navigate().GoToUrl("https://testnet.joystream.org/");

            Thread.Sleep(20000);

            /////////////// part to import json wallet
           
            IList<IWebElement> allElementsq = driver.FindElements(By.CssSelector("*"));
            foreach (var element1 in allElementsq)
            {
                if (element1.Text == "My Keys")

                {
                    element1.Click(); break;

                }
            }
            Thread.Sleep(2000);
            IList<IWebElement> allElementsw= driver.FindElements(By.CssSelector("*"));
            foreach (var element1 in allElementsw)
            {
                if (element1.Text == "Restore JSON")

                {
                    element1.Click(); break;

                }
            }
            Thread.Sleep(2000);

            IWebElement currentElement1 = driver.SwitchTo().ActiveElement();
            currentElement1.SendKeys(pass);
            IList<IWebElement> allElementst = driver.FindElements(By.CssSelector("*"));

            foreach (var element1 in allElementst)
            {

              
                if (element1.Text.ToString()== "click to select or drag and drop the file here")

                {
                    int el = allElementst.IndexOf(element1);

                    allElementst[el].Click();
                    Thread.Sleep(2000);

                    Thread.Sleep(10000);


                }

            
                
            }
           
                Thread.Sleep(10000);
            IList<IWebElement> allElementse = driver.FindElements(By.CssSelector("*"));

            foreach (var element1 in allElementse)
            {
                if (element1.Text == "Restore")

                {
                    element1.Click(); break;

                }
            }

            Thread.Sleep(5000);


            /////////////// end part to import
startlabel:   
            try { 
                

                    List<string> addresses = new List<string>();
                    using (var con = GetConnectionsString())
                    {
                        string qry = "SELECT address FROM info WHERE funded='false' and address !='null'";
                        var cmd = new SqlCommand(qry, con);
                        cmd.CommandType = CommandType.Text;
                        con.Open();
                        using (SqlDataReader objReader = cmd.ExecuteReader())
                        {
                            if (objReader.HasRows)
                            {
                                while (objReader.Read())
                                {
                                    //I would also check for DB.Null here before reading the value.
                                    string item = objReader.GetString(objReader.GetOrdinal("address"));
                                    addresses.Add(item);
                                }
                            }
                        }
                        con.Close();
                    }


                int cc = addresses.Count;
            if (cc<=0)
            {
                goto startlabel;
            }



                foreach (var address in addresses)    // where addreses whom need to send
                {




                    string addrestosend = address;


                    IList<IWebElement> allElements = driver.FindElements(By.CssSelector("*"));
                    foreach (var element1 in allElements)
                    {
                        if (element1.Text == "Transfer")

                        {
                            element1.Click(); break;

                        }
                    }

                    Thread.Sleep(3000);




                    IWebElement currentElement = driver.SwitchTo().ActiveElement();


                    IList<IWebElement> allElements1 = driver.FindElements(By.CssSelector("*"));


                    currentElement.SendKeys(Keys.Backspace);
                    currentElement.SendKeys(amount); //good

                    IList<IWebElement> allElementsclass = driver.FindElements(By.CssSelector("input[aria-autocomplete = 'list']"));

                    allElementsclass[2].SendKeys(addrestosend);




                    Thread.Sleep(1000);


                    IList<IWebElement> allElements2 = driver.FindElements(By.CssSelector("*"));

                    foreach (var element2 in allElements2)
                    {
                        if (element2.Text == "Make Transfer")

                        {
                            element2.Click(); break;

                        }
                    }


                    Thread.Sleep(1000);


                    IWebElement currentElementpass = driver.SwitchTo().ActiveElement();

                    currentElementpass.SendKeys(pass);


                    IList<IWebElement> allElements3 = driver.FindElements(By.CssSelector("*"));

                    foreach (var element3 in allElements3)
                    {
                        if (element3.Text == "Sign and Submit")

                        {
                            element3.Click();
                            Thread.Sleep(6000);
                            break;
                        }
                    }



                    string sqlupdfunded = $"UPDATE info SET funded='true' WHERE address='{addrestosend}'";
                    SQLUpdate(sqlupdfunded);
                    string sqlgetid = $"SELECT uid FROM info WHERE address='{addrestosend}'";

                    try
                    {

                   

                    Notifier(SQLGetData(sqlgetid).ToString());


                    }
                    catch (Exception)
                    {

                        Console.WriteLine("ex");                    }



                    //get chatid to whom send



                    //var logFiletosend = File.ReadAllLines(allinfopath);

                    //    var chatidlist = new List<string>(logFiletosend);
                    /*
                        var match = chatidlist
              .FirstOrDefault(stringToCheck => stringToCheck.Contains(address));
                        string chatid = "";
                        if (match!=null)
                        {
                            chatid = match.Replace(address+";","");
                        }
                        //
                        try
                        {
                            Notifier(chatid); //send tg notice
                        }
                        catch (Exception)
                        {
                            Console.WriteLine("Exception at notifier");
                         }
                    */
                    /*
                        File.WriteAllLines(pathwhotosend,
                        File.ReadLines(pathwhotosend).Where(l => l != $"{address}").ToList());
                    */
                    driver.Navigate().GoToUrl("https://testnet.joystream.org/");

                 

                    Thread.Sleep(15000);
                    goto startlabel;





                }
            }
            catch (Exception)
            {
                throw;
                Console.WriteLine("ex");
            }

        }

        //Joystream Network Portal - Google Chrome
        static void Main(string[] args)
        {

            string passforwallet = "123";
            string amounttosend = "101";

            Browsersender(passforwallet, amounttosend);
        


        }
    }
}