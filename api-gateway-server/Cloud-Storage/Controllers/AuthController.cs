using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Cloud_Storage.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public async Task<string> test()
        {
            var client = _httpClientFactory.CreateClient("laravel");
            //            client.DefaultRequestHeaders.Authorization = string("Bearer " + Request.Headers["Authorization"]);
            string result = "";
            try
            {
                result = await client.GetStringAsync("/api/user");
            }
            catch (Exception e)
            {
                result = "Unauthorized";
            }

            return result;
        }

        [HttpPost]
        public async Task<String> login([FromBody]JObject body)
        {
            return "asdASD";

            var client = _httpClientFactory.CreateClient("laravel");

            User user = new User(body["email"].ToString(), body["password"].ToString());
            string result = "";
         
            try
            {
                var jsonAsString = JsonConvert.SerializeObject(user);
                var res = await client.PostAsync("/api/login", new StringContent(jsonAsString, Encoding.UTF8, "application/json"));
                result =  res.ToString();
                
            }
            catch (Exception e)
            {
                result = "Unauthorized";
            }

            return result;
        }
    }

    class User
    {
        private string email;
        private string name;
        private string password;
        private object read;

        public User(object read)
        {
            this.read = read;
        }

        public User(string email, string password, string name = "user")
        {
            this.email = email;
            this.password = password;
            this.name = name;
        }
    }
}