const Job = require('../models/Job');
const Bid = require('../models/Bid');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateBiddingSuggestions(jobId, freelancerProfile) {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  // Find similar jobs to suggest price
  const similarJobs = await Job.find({ category: job.category, status: 'completed' });
  
  // Use job's own budget as the baseline, guard against missing fields
  const baseMin = job.budgetMin ?? 10;
  const baseMax = job.budgetMax ?? 100;

  let suggestedMin = Math.max(10, Math.floor(baseMin * 0.9));
  let suggestedMax = Math.ceil(baseMax * 1.1);

  if (similarJobs.length > 0) {
    // Average the budgets of similar completed jobs as a refined estimate
    const avgBudget = similarJobs.reduce((sum, j) => sum + ((j.budgetMin + j.budgetMax) / 2), 0) / similarJobs.length;
    suggestedMin = Math.max(10, Math.floor(avgBudget * 0.9));
    suggestedMax = Math.ceil(avgBudget * 1.1);
  }

  // Suggested delivery time
  const estimatedDeliveryTime = '3–5 days';

  let draftCoverMessage = '';

  try {
    if (process.env.GEMINI_API_KEY) {
      // Use Google Gemini API
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are a professional student freelancer applying for a job on a platform called StuGig.
        Write a concise, professional cover letter (max 3 short paragraphs) to bid on this job.
        
        Job Title: ${job.title}
        Job Category: ${job.category}
        Job Description: ${job.description}
        Budget Range: $${job.budgetMin} - $${job.budgetMax}
        
        Freelancer Skills: ${freelancerProfile.skills ? freelancerProfile.skills.join(', ') : 'General skills'}
        Proposed Delivery Time: ${estimatedDeliveryTime}
        
        Make it sound enthusiastic, relevant to the job description, and confident. Do not include placeholders like [Your Name], keep it ready to send.
      `;

      const result = await model.generateContent(prompt);
      draftCoverMessage = result.response.text().trim();
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fall back to template if API fails
  }

  // Fallback if API key missing or API failed
  if (!draftCoverMessage) {
    draftCoverMessage = `Hi! I noticed your posting for "${job.title}". I have relevant experience in ${
      job.category
    } and I'm confident I can deliver exactly what you need. My proposed timeline is ${estimatedDeliveryTime} and I'm happy to discuss any details. Looking forward to working with you!`;
  }

  // Return suggestedPriceRange as a formatted string so the frontend can .match() digits directly
  return {
    suggestedPriceRange: `$${suggestedMin}–$${suggestedMax}`,
    estimatedDeliveryTime,
    draftCoverMessage,
  };
}

module.exports = { generateBiddingSuggestions };
