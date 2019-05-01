using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Cloud_Storage.Models;
using Cloud_Storage.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Cloud_Storage.Controllers
{
    [ApiController]
    public class DFSController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IAuthService _authService;

        public DFSController(IHttpClientFactory httpClientFactory, IAuthService authService)
        {
            _httpClientFactory = httpClientFactory;
            _authService = authService;
        }

        [Route("api/files")]
        [HttpGet]
        public async Task<ActionResult<Object>> index()
        {
            var user = await _authService.getUser(Request.Headers["Authorization"]);
            if (user == null) return Unauthorized();

            var client = _httpClientFactory.CreateClient("DFS");
            var res = await client.GetAsync("files");
            return await res.Content.ReadAsStringAsync();
        }
    }
}