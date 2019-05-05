using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using Cloud_Storage.Models;
using Cloud_Storage.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using File = Cloud_Storage.Models.File;

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
        public async Task<IEnumerable<File>> index()
        {
            var user = await _authService.getUser(Request.Headers["Authorization"]);

            var client = _httpClientFactory.CreateClient("DFS");
            var res = await client.GetAsync("files/"+user.id);
            
            return await res.Content.ReadAsAsync<IEnumerable<File>>();
        }

        [Route("api/files")]
        [HttpPost]
        public async Task<ActionResult<File>> upload([FromForm]UploadRequest body)
        {
            var user = await _authService.getUser(Request.Headers["Authorization"]);
            if (user == null) return BadRequest();

            var client = _httpClientFactory.CreateClient("DFS");
            body.owner_id = user.id;

            var multi = new MultipartFormDataContent();
            var fileContent = new StreamContent(body.file.OpenReadStream());
            multi.Add(fileContent, "file", body.file.FileName);
            multi.Add(new StringContent(""+(user.id)), "owner_id");
            multi.Add(new StringContent("" + body.parent_id), "parent_id");
            var res = await client.PostAsync("upload", multi);
            if (!res.IsSuccessStatusCode) return BadRequest();
            return await res.Content.ReadAsAsync<File>();
        }

        [HttpPost]
        [Route("api/folder")]
        public async Task<ActionResult> createFolder([FromBody]JObject body)
        {
            var user = await _authService.getUser(Request.Headers["Authorization"]);
            if (user == null) return Unauthorized();

            var client = _httpClientFactory.CreateClient("DFS");
            body.Add("owner_id", user.id);
            var res = await client.PostAsJsonAsync("create-folder", body);
            if (!res.IsSuccessStatusCode) return BadRequest();
            return Ok();
        }

        [HttpPut("{id}")]
        [Route("api/update-file/{id}")]
        public async Task<ActionResult> update(int id, [FromBody]JObject body)
        {
            var user = await _authService.getUser(Request.Headers["Authorization"]);
            if (user == null) return Unauthorized();

            var client = _httpClientFactory.CreateClient("DFS");
            var res = await client.PutAsJsonAsync("file/"+id, body);
            return Ok();
        }

        [HttpDelete("{id}")]
        [Route("api/delete-file/{id}")]
        public async Task<ActionResult> delete(int id)
        {
            var user = await _authService.getUser(Request.Headers["Authorization"]);
            if (user == null) return Unauthorized();

            var client = _httpClientFactory.CreateClient("DFS");
            var res = await client.DeleteAsync("file/"+id);
            return Ok();
        }
    }
}