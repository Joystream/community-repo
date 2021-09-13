#!/bin/bash

mkdir bounties
mkdir council
mkdir working-groups
mkdir working-groups/curator_group
mkdir working-groups/operations_group
mkdir working-groups/storage_group
mkdir working-groups/storage_group/reports
mkdir working-groups/storage_group/reports/sumer
mkdir community-contributions/creative
mkdir community-contributions/tech
mkdir community-contributions/research
mkdir council/kpi
git mv documentation governance
git mv bounties-overview bounties
git mv bounties-reports bounties
git mv council-reports council
git mv community-contributions/discordbot community-contributions/research/
git mv community-contributions/report-generator community-contributions/tech/
git mv community-contributions/joystreamtelegrambot community-contributions/tech/
git mv community-contributions/joystreamvideobot community-contributions/tech/
git mv community-contributions/substrate_polkadot_content_list community-contributions/research/
git mv community-contributions/validator-report-backend/ community-contributions/tech
git mv community-contributions/validator-report-ui/ community-contributions/tech
git mv community-contributions/banner-competition community-contributions/creative/
git mv community-contributions/community-repo_banners community-contributions/creative/
git mv community-contributions/stickers-competition community-contributions/creative/
git mv community-contributions/scriptnodeSetup community-contributions/node-setup-script
git mv community-contributions/node-setup-script community-contributions/tech/
git mv community-contributions/Ledger\ for\ Joystream community-contributions/ledger-for-joystream
git mv community-contributions/ledger-for-joystream community-contributions/research/
mkdir council/kpi/sumer
mkdir council/kpi/sumer/16.9
git mv community-contributions/kpi_169_-_follow_up_the_storage_working_group.md council/kpi/sumer/16.9
mkdir council/kpi/sumer/11.4
git mv community-contributions/KPI\ 11.4\ -\ Research\ Max\ Validator\ Change/report.md council/kpi/sumer/11.4
mkdir council/kpi/sumer/06.6
git mv community-contributions/miscellaneous_reports/Content\ Sourcing\ Report.md council/kpi/sumer/06.6/
git mv community-contributions/miscellaneous_reports/Increase\ Validator\ Set\ Research.md community-contributions/research/increase_validators_set.md
git mv community-contributions/miscellaneous_reports/Polkadot\ JS\ Extension.md community-contributions/research/polkadot_js_extension.md
mkdir council/kpi/sumer/09.6
git mv community-contributions/miscellaneous_reports/KPI_09-6-initial_sprocket.md council/kpi/sumer/09.6/
git mv community-contributions/founding-member-survey community-contributions/research/
git mv operations/* working-groups/operations_group/
git mv tokenomics-reports council
git mv submission-log council
git mv council-survey council
mkdir council/kpi/sumer/17.8
git mv rules/Sumer_KPI_17.8_Clean_Up_Community_Repo_16.08.2021.md council/kpi/sumer/17.8
git mv rules/* governance/
git mv governance/bounty15 bounties/bounties-reports/
git mv governance/bounty10_crash_payouts.csv bounties/bounties-reports/
git mv workinggroup-reports/curator_group/* working-groups/curator_group/
git mv workinggroup-reports/storage_group/* working-groups/storage_group
mkdir bounties/bounties-reports/weekly-bounty-report
git mv workinggroup-reports/bounty_reports/* bounties/bounties-reports/weekly-bounty-report
git mv council/council-reports council/reports
git mv council/tokenomics-reports council/tokenomics
git mv bounties/bounties-overview bounties/overview
git mv bounties/bounties-reports bounties/reports
git mv community-contributions contributions
