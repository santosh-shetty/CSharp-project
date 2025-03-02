using Microsoft.AspNetCore.Mvc;
using ProcureX.Models;
using ProcureX.Services;

namespace ProcureX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly CompanyService _companyService;

        public CompanyController(CompanyService companyService)
        {
            _companyService = companyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _companyService.GetAllAsync();
            return Ok(companies);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var company = await _companyService.GetByIdAsync(id);
            if (company == null) return NotFound();
            return Ok(company);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Company company)
        {
            var newCompany = await _companyService.AddAsync(company);
            return CreatedAtAction(nameof(GetById), new { id = newCompany.Id }, newCompany);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Company company)
        {
            var updated = await _companyService.UpdateAsync(id, company);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _companyService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
