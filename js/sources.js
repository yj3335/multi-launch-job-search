/*
 * Source catalog. Google-backed sources carry a `site:` expression so several
 * can be OR'd into one combined search per tab. Sources with their own native
 * search (LinkedIn, Remote Rocketship) carry a `special` builder instead and
 * always open as their own tab.
 */

const SOURCES = [
  ["ATS Platforms", [
    ["Greenhouse", "site:greenhouse.io"],
    ["Lever", "site:lever.co"],
    ["Ashby", "site:ashbyhq.com"],
    ["Pinpoint", "site:pinpointhq.com"],
    ["Workable", "site:workable.com"],
    ["BreezyHR", "site:breezy.hr"],
    ["Recruitee", "site:recruitee.com"],
    ["Rippling", "(site:rippling.com OR site:rippling-ats.com)"],
    ["Gusto", "site:jobs.gusto.com"],
    ["Teamtailor", "site:teamtailor.com"],
    ["SmartRecruiters", "site:jobs.smartrecruiters.com"],
    ["TalentReef", "site:jobappnetwork.com"],
    ["Homerun", "site:homerun.co"],
    ["Gem", "site:gem.com"],
    ["Trakstar", "site:trakstar.com"],
    ["Cats", "site:catsone.com"],
    ["JazzHR", "site:applytojob.com"],
    ["Jobvite", "site:jobvite.com"],
    ["iCIMS", "site:icims.com"],
    ["Dover", "site:dover.io"],
    ["Workday Jobs", "(site:myworkdayjobs.com OR site:myworkdaysite.com)"],
    ["ADP", "(site:workforcenow.adp.com OR site:myjobs.adp.com)"],
    ["Paylocity", "site:recruiting.paylocity.com"],
    ["Keka", "site:keka.com"],
    ["Factorial", "site:factorialhr.com"],
    ["TriNet Hire", "site:trinethire.com"],
    ["Personio", "site:personio.com"],
    ["Dayforce", "site:dayforcehcm.com"],
    ["Oracle Cloud", "site:oraclecloud.com"],
  ]],
  ["Boards & Networks", [
    ["LinkedIn", null, (job, options) => linkedInUrl(job, options)],
    ["Glassdoor", "site:glassdoor.com/job-listing/"],
    ["Wellfound", "site:wellfound.com"],
    ["Y Combinator WaaS", "site:workatastartup.com"],
    ["Builtin", "site:builtin.com/job/"],
    ["Notion (job posts)", "site:notion.site"],
    ["Remote Rocketship", null, (job) => remoteRocketshipUrl(job)],
  ]],
  ["Generic Career Pages", [
    ["Jobs subdomain", "site:jobs.*"],
    ["Careers pages", "(site:careers.* OR site:*/careers/* OR site:*/career/*)"],
    ["People subdomain", "site:people.*"],
    ["Talent subdomain", "site:talent.*"],
    ["Other pages", "(site:*/employment/* OR site:*/opportunities/* OR site:*/openings/* OR site:*/join-us/* OR site:*/work-with-us/*)"],
  ]],
];
