# Portfolio analytics

## Contentsquare events

- Opening the projects section: virtual pageview `/portfolio/projects`.
- Opening a project: virtual pageview `/portfolio/project/<project-slug>` and `project_opened_<project-slug>` page event.
- Clicking either email link: `contact_email_clicked` page event.
- Clicking the LinkedIn contact link: `contact_linkedin_clicked` page event.
- Successful Formspree response: virtual pageview `/portfolio/enquiry-success`, plus the `form_submitted=design_system_enquiry` dynamic variable and Hotjar `form_submitted` event.

The saved funnel is a **sequential** journey: site entry → projects section → project opened → successful enquiry. A submission that skips a preceding step appears in the standalone success metric but not at the funnel's final step.

The Contentsquare [Company Link Performance dashboard](https://app.contentsquare.com/#/dashboards/74d6159a-1c99-47cf-8ad6-b881f7d3ab10?project=1062872) compares the existing Vinted, Hostinger, and LinkedIn segments by site sessions, project opens, and successful enquiries. It also has a separate `LinkedIn contact clicks` widget. The `Portfolio journey` mapping defines `Project opened` and `Enquiry success` page groups. The existing `Переходы к разделу работ (#projects)` segment now matches `/portfolio/projects`; URL fragments such as `#projects` are not included in the tracked page URL.

To validate the full funnel, open a company link in a fresh browser session, scroll to Projects, open a project, and submit one clearly marked test enquiry. Then check the session in Contentsquare after processing. Do not treat the current zero at step 4 as a tracking error unless a completed test journey is missing there.

On 2026-10-08, one marked test enquiry returned Formspree success after a Hostinger link visit and project open. Contentsquare then showed one completed funnel session. A LinkedIn contact click was also recorded as `contact_linkedin_clicked` and is available in the saved `LinkedIn contact clicks` segment. The email click handler is deployed, but receipt of `contact_email_clicked` has not yet been verified in Contentsquare.

## Shareable links

These examples are for links sent in a LinkedIn message. They keep `company` for site theme/Contentsquare segmentation and add UTM parameters for GA4 acquisition reporting:

- Vinted: https://portfolio-lyart-alpha-67.vercel.app/?company=vinted&utm_source=linkedin&utm_medium=message&utm_campaign=portfolio_outreach&utm_content=vinted
- Hostinger: https://portfolio-lyart-alpha-67.vercel.app/?company=hostinger&utm_source=linkedin&utm_medium=message&utm_campaign=portfolio_outreach&utm_content=hostinger
- General LinkedIn: https://portfolio-lyart-alpha-67.vercel.app/?company=linkedin&utm_source=linkedin&utm_medium=message&utm_campaign=portfolio_outreach&utm_content=general

When sharing by email, use `utm_source=email` and `utm_medium=email` instead. Set `utm_source` to the real channel, not the recipient company. Already shared links continue to work without UTM parameters.
