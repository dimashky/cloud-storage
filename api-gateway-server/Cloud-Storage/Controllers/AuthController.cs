using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Cloud_Storage.Models;
using Cloud_Storage.Services;
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
        private readonly IAuthService _authService;
        public AuthController(IHttpClientFactory httpClientFactory, IAuthService authService)
        {
            _httpClientFactory = httpClientFactory;
            _authService = authService;
        }

        [HttpGet]
        [Route("api/user")]
        public async Task<ActionResult<User>> getUserFromAccessToken()
        {
            string accessToken = Request.Headers["Authorization"];
            var user = await _authService.getUser(accessToken);
            if (user == null) return Unauthorized();
            return user;
        }

        [HttpPost]
        [Route ("api/login")]
        public async Task<ActionResult<User>> login([FromBody]JObject body)
        {           
            var client = _httpClientFactory.CreateClient("laravel");
            var res = await client.PostAsJsonAsync("api/login", body);
            if (!res.IsSuccessStatusCode) return BadRequest();
            var user = (await res.Content.ReadAsAsync<User>());
            return user;
        }

        [HttpPost]
        [Route("api/register")]
        public async Task<ActionResult<User>> register([FromBody]JObject body)
        {
            var client = _httpClientFactory.CreateClient("laravel");
            var res = await client.PostAsJsonAsync("api/register", body);
            if(!res.IsSuccessStatusCode) return BadRequest();
            var user = (await res.Content.ReadAsAsync<User>());
            return user;
        }
    }
}