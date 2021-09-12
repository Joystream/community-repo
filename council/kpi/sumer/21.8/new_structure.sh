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
mv documentation governance
mv bounties-overview bounties
mv bounties-reports bounties
mv council-reports council
mv community-contributions/discordbot community-contributions/research/
mv community-contributions/report-generator community-contributions/tech/
mv community-contributions/joystreamtelegrambot community-contributions/tech/
mv community-contributions/joystreamvideobot community-contributions/tech/
mv community-contributions/substrate_polkadot_content_list community-contributions/research/
mv community-contributions/validator-report-backend/ community-contributions/tech
mv community-contributions/validator-report-ui/ community-contributions/tech
mv community-contributions/banner-competition community-contributions/creative/
mv community-contributions/community-repo_banners community-contributions/creative/
mv community-contributions/stickers-competition community-contributions/creative/
mv community-contributions/scriptnodeSetup community-contributions/node-setup-script
mv community-contributions/node-setup-script community-contributions/tech/
mv community-contributions/Ledger\ for\ Joystream community-contributions/ledger-for-joystream
mv community-contributions/ledger-for-joystream community-contributions/research/
mkdir council/kpi/sumer
mkdir council/kpi/sumer/16.9
mv community-contributions/kpi_169_-_follow_up_the_storage_working_group.md council/kpi/sumer/16.9
mkdir council/kpi/sumer/11.4
mv community-contributions/KPI\ 11.4\ -\ Research\ Max\ Validator\ Change/report.md council/kpi/sumer/11.4
rm -r community-contributions/KPI\ 11.4\ -\ Research\ Max\ Validator\ Change
mkdir council/kpi/sumer/06.6
mv community-contributions/miscellaneous_reports/Content\ Sourcing\ Report.md council/kpi/sumer/06.6/
mv community-contributions/miscellaneous_reports/Increase\ Validator\ Set\ Research.md community-contributions/research/increase_validators_set.md
mv community-contributions/miscellaneous_reports/Polkadot\ JS\ Extension.md community-contributions/research/polkadot_js_extension.md
mkdir council/kpi/sumer/09.6
mv community-contributions/miscellaneous_reports/KPI_09-6-initial_sprocket.md council/kpi/sumer/09.6/
rm -r community-contributions/miscellaneous_reports
mv community-contributions/founding-member-survey community-contributions/research/
mv operations/* working-groups/operations_group/
rm -r operations/
mv tokenomics-reports council
mv submission-log council
mv council-survey council
mkdir council/kpi/sumer/17.8
mv rules/Sumer_KPI_17.8_Clean_Up_Community_Repo_16.08.2021.md council/kpi/sumer/17.8
mv rules/* governance/
rm -r rules/
mv governance/bounty15 bounties/bounties-reports/
mv governance/bounty10_crash_payouts.csv bounties/bounties-reports/
mv workinggroup-reports/curator_group/* working-groups/curator_group/
mv workinggroup-reports/storage_group/* working-groups/storage_group
mkdir bounties/bounties-reports/weekly-bounty-report
mv workinggroup-reports/bounty_reports/* bounties/bounties-reports/weekly-bounty-report
rm -r workinggroup-reports/bounty_reports

