# Portfolio analytics

## Contentsquare events

- Opening the projects section: virtual pageview `/portfolio/projects`.
- Opening a project: virtual pageview `/portfolio/project/<project-slug>` and `project_opened_<project-slug>` page event.
- Clicking either email link: `contact_email_clicked` page event.
- Clicking the LinkedIn contact link: `contact_linkedin_clicked` page event.
- Successful Formspree response: virtual pageview `/portfolio/enquiry-success`, plus the `form_submitted=design_system_enquiry` dynamic variable and Hotjar `form_submitted` event.

The saved funnel is a **sequential** journey: site entry → projects section → project opened → successful enquiry. A submission that skips a preceding step appears in the standalone success metric but not at the funnel's final step.

To validate the full funnel, open a company link in a fresh browser session, scroll to Projects, open a project, and submit one clearly marked test enquiry. Then check the session in Contentsquare after processing. Do not treat the current zero at step 4 as a tracking error unless a completed test journey is missing there.

## Shareable links

These examples are for links sent in a LinkedIn message. They keep `company` for site theme/Contentsquare segmentation and add UTM parameters for GA4 acquisition reporting:

- Vinted: https://portfolio-lyart-alpha-67.vercel.app/?company=vinted&utm_source=linkedin&utm_medium=message&utm_campaign=portfolio_outreach&utm_content=vinted
- Hostinger: https://portfolio-lyart-alpha-67.vercel.app/?company=hostinger&utm_source=linkedin&utm_medium=message&utm_campaign=portfolio_outreach&utm_content=hostinger
- General LinkedIn: https://portfolio-lyart-alpha-67.vercel.app/?company=linkedin&utm_source=linkedin&utm_medium=message&utm_campaign=portfolio_outreach&utm_content=general

When sharing by email, use `utm_source=email` and `utm_medium=email` instead. Set `utm_source` to the real channel, not the recipient company. Already shared links continue to work without UTM parameters.
