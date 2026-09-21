import type { ProjectPlan } from './projectPlanTypes';

/** Default briefs for high Prioritize projects — session edits still win when filled. */
export const FEATURE_PLAN_SEEDS: Record<string, ProjectPlan> = {
  yluy9f0i: {
    problemStatement:
      'HR still screens by hand: hours on CVs and cover letters, then a second pass to invent interview questions. The first pass is a hard-skill compare against the public job ad — work a candidate can prep the same way. Adsomnia’s actual edge is private: culture, how this department works, and who is already on the team. That context never makes the interview kit today, so interviews re-test the website posting instead of zooming in on soft skills. The Claude proof already filters CVs; it still lives as a chat and stops at the shortlist. They are not hiring at volume. GDPR is still open.',
    opportunity:
      'One packaged hiring skill. Same run: score CVs and covering letters against the role on the site (hard skills), then load Adsomnia culture and current team/department notes so the interviewer walks in with questions a candidate cannot reverse-engineer from the job page. Soft skills and culture fit are the interview, not a side prompt. Later, when they hire for real, the same skill can take Enneagram (or similar) profiles of people already on the team and hire into the gaps that would boost synergy — that is scale, not this pack.',
    solutions:
      'Keep this in Claude. Package the chat into a skill folder (SKILL.md, scorecard, example CVs/cover letters, a shortlist they stand behind) and put culture + current-team notes in the same folder. Hard-skill match vs the public posting is the floor. The interview kit is weighted to soft skills, culture, and how they would sit with this team/department. Cover letters stay first-class. Do not split interview prep onto another chip. Do not build a handbook product or an ATS. Prove on one past or hypothetical applicant. Enneagram team-gap hiring is written as a later slice, not collected in this sprint.',
    functionalities: [
      {
        id: 'fn-skill-pack',
        title: 'Packaged skill, not a chat',
        description:
          'SKILL.md, the role/scorecard they used, two example CVs plus cover letters, and one shortlist they would stand behind. A colleague can run a dry screen from the files alone.',
      },
      {
        id: 'fn-hard-skill-screen',
        title: 'Hard-skill fit vs the public role',
        description:
          'Compare pasted/exported CVs and covering letters to the job opportunity as it sits on the website (must-haves / nice-to-haves). This is the consistent first pass — necessary, but not the interview.',
      },
      {
        id: 'fn-compare-shortlist',
        title: 'Comparable shortlist',
        description:
          'Who made the hard-skill cut, why, and what raised concerns. Strengths and gaps side by side so the hiring call is not a gut stack of PDFs.',
      },
      {
        id: 'fn-culture-team',
        title: 'Adsomnia culture and current team context',
        description:
          'Private notes on culture, how this department works, and who is already on the team. This is the edge: a candidate can prep the JD; they cannot prep how Adsomnia actually operates. Not a handbook Q&A product — a short pack HR already has.',
      },
      {
        id: 'fn-soft-skill-kit',
        title: 'Soft-skill interview kit (the actual interview)',
        description:
          'For each shortlisted candidate: questions and probes that zoom in on culture fit, collaboration, and how they would sit with this team — not a recap of hard skills they (and we) can already score from the application. The interviewer walks in with Adsomnia’s advantage.',
      },
      {
        id: 'fn-hr-only-input',
        title: 'HR-owned paste/export',
        description:
          'CVs stay in their own Claude project. No TeamTailor dump, no LinkedIn scrape, no sharing candidate files outside HR. GDPR stays a policy call, not a platform build.',
      },
      {
        id: 'fn-enneagram-later',
        title: 'Later: team Enneagram / synergy gaps',
        description:
          'Once the skill is trusted, optionally support it with Enneagram (or similar) profiles of people on the current team so hiring can target gaps that boost synergy. Scale opportunity only — do not collect personality profiles in this sprint.',
      },
    ],
    expectedImpact:
      'Shortlists stay consistent on hard skills. Interviews stop re-testing the job ad and start testing culture and soft skills, where Adsomnia actually has an information advantage. Same skill, one motion. No ATS while volume is low. A clear later path to team-gap / Enneagram hiring when they scale.',
    businessValue:
      'HR judgement on the things a CV cannot show. Interviewers walk in better prepared than the candidate, because culture and team context are not public. Avoids a hiring product they do not have openings to fill. Leaves a synergy-hiring option for when teams grow.',
    technicalApproach:
      'Claude Project / skill folder owned by HR (Laia). Inputs: public JD + scorecard, pasted CVs/cover letters, culture and current team/department notes. Outputs: hard-skill comparison, shortlist, soft-skill/culture interview kit. No TeamTailor, LinkedIn, or Personio API. Handbook Q&A stays a sibling. Enneagram profiles are out of this pack. Prove on one past or made-up applicant until they are hiring.',
    targetAudience: [
      'HR (Laia and whoever runs a dry screen)',
      'Hiring managers / interviewers using the kit',
      'Current team leads whose department context feeds the kit',
      'Not candidates — they never see this tool',
    ],
    risks: [
      'GDPR: what candidate data may go into Claude. Until decided, use past or hypothetical packs, not live applicants.',
      'Bias: scorecards and culture notes must be reviewed; the skill should surface concerns, not hide them.',
      'Culture notes that are vague will produce generic “culture fit” questions — the pack has to name how this team actually works.',
      'Hard-skill questions will creep back into the kit if the prompt is not explicit that the interview zooms in on soft skills.',
      'Enneagram / personality profiling of current staff is sensitive and optional later — collecting it now would stall the proof.',
      'Not hiring now — proof is a dry run, not a live desk.',
      'Do not become an ATS. Volume, TeamTailor, LinkedIn, and synergy-gap hiring come after a successful proof.',
    ],
    dependencies: [
      'Existing successful Claude run (filter + strengths/concerns) as the seed.',
      'The public job opportunity / scorecard for the hard-skill pass.',
      'Written Adsomnia culture notes plus current team/department context (who is on the team, how they work).',
      'Two example CVs + cover letters and one shortlist they stand behind.',
      'HR-only Claude project; candidate files not shared outside HR.',
      'GDPR call before live applicant files go in.',
      'Enneagram (or similar) profiles of current teammates — only if/when they choose the later scale slice.',
    ],
  },
};
