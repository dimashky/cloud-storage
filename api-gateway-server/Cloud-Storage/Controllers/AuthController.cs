using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Cloud_Storage.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        [Route("api/user")]
        public async Task<ActionResult<Object>> test()
        {
            string accessToken = Request.Headers["Authorization"];
            var client = _httpClientFactory.CreateClient("laravel");
            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", accessToken);
            var res = await client.GetAsync("api/user");
            if (!res.IsSuccessStatusCode) return Unauthorized();
            var user = (await res.Content.ReadAsAsync<User>());
            return user;
        }

        [HttpPost]
        [Route ("api/login")]
        public async Task<ActionResult<Object>> login([FromBody]JObject body)
        {           
            var client = _httpClientFactory.CreateClient("laravel");
            var res = await client.PostAsJsonAsync("api/login", body);
            if (!res.IsSuccessStatusCode) return BadRequest();
            var user = (await res.Content.ReadAsAsync<User>());
            return user;
        }

        [HttpPost]
        [Route("api/register")]
        public async Task<ActionResult<Object>> register([FromBody]JObject body)
        {
            var client = _httpClientFactory.CreateClient("laravel");
            var res = await client.PostAsJsonAsync("api/register", body);
            if(!res.IsSuccessStatusCode) return BadRequest();
            var user = (await res.Content.ReadAsAsync<User>());
            return user;
        }
    }

    public class User
    {
        public string email { get; set; }
        public string name { get; set; }
        public string accessToken { get; set; }
        private string password { get; set; }



        public User(string email, string password, string name = "user")
        {
            this.email = email;
            this.password = password;
            this.name = name;
        }
    }
}