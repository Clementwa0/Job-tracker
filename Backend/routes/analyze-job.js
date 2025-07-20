const express = require('express');
const router = express.Router();
const { Groq } = require('groq-sdk');

const groq = new Groq();

router.post('/', async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ message: 'Missing job description.' });
  }

  const prompt = `
Extract the following fields from the job description:

- jobTitle
- companyName
- location
- jobType
- jobPostingUrl
- salaryRange
- applicationDeadline
- contactPerson
- contactEmail
- contactPhone
- notes (summary of responsibilities)
- nextStepsDate (if mentioned)

Respond ONLY with a valid JSON object and NO explanation or formatting. Here's an example of the expected format:

{
  "jobTitle": "Software Engineer",
  "companyName": "Acme Corp",
  "location": "Nairobi, Kenya",
  "jobType": "Full-time",
  "jobPostingUrl": "https://example.com",
  "salaryRange": "Kes 100,000 - 120,000",
  "applicationDeadline": "2025-08-01",
  "contactPerson": "Jane Doe",
  "contactEmail": "jane@acme.com",
  "contactPhone": "+254700000000",
  "notes": "Responsible for frontend development using React.",
  "nextStepsDate": "2025-08-07"
}

Now extract the fields from this job description:
"""${description}"""
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'compound-beta-mini',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || '';

    // Extract JSON inside markdown ``` block
    let jsonText = content.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
    }

    const extractedData = JSON.parse(jsonText);

    return res.json(extractedData);
  } catch (error) {
    console.error('Groq parse error:', error.message);
    return res.status(500).json({ message: 'Failed to analyze job description' });
  }
});

module.exports = router;
