-- Show Ouma partner spotlight on the landing page (Data API + isCampaignActive require enabled = true)
update public.partner_campaigns
set enabled = true
where slug = 'ouma';
