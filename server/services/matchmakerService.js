const Job = require('../models/Job');
const Bid = require('../models/Bid');

async function getJobMatchesForFreelancer(freelancer, userSkills) {
  // fetch open jobs
  const openJobs = await Job.find({ status: 'open' });
  
  // calculate score
  const scoredJobs = openJobs.map(job => {
    let score = 0;
    
    // Skill overlap (up to 60 points)
    if (job.skillsRequired && job.skillsRequired.length > 0) {
      const overlap = job.skillsRequired.filter(skill => userSkills.includes(skill)).length;
      score += (overlap / job.skillsRequired.length) * 60;
    } else {
      score += 30; // default if no skills specified
    }

    // Category match (up to 20 points)
    // In a real app, this might use the user's past bids or a profile preference field.
    // We'll give 20 points randomly to simulate different category affinities for now,
    // or if the job category is in user's skills.
    if (userSkills.includes(job.category)) {
      score += 20; 
    } else {
      score += 10;
    }
    
    // Budget fit (up to 20 points)
    // Simple heuristic: just assigning 15 points
    score += 15;
    
    // clamp to 0-100
    const finalScore = Math.min(Math.max(Math.round(score), 0), 100);

    return {
      job,
      matchScore: finalScore
    };
  });

  // Sort descending by score
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
  
  return scoredJobs;
}

module.exports = { getJobMatchesForFreelancer };
