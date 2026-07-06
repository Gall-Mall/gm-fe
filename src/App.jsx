import { Header } from './components/Header';
import { useAppFlow } from './app/useAppFlow';
import { GroupAnalysisPage } from './features/analysis/GroupAnalysisPage';
import { LoginPage } from './features/auth/LoginPage';
import { CreateTripPage } from './features/groups/CreateTripPage';
import { DashboardPage } from './features/groups/DashboardPage';
import { GroupsPage } from './features/groups/GroupsPage';
import { LandingPage } from './features/landing/LandingPage';
import { RecommendationVotePage } from './features/recommendation/RecommendationVotePage';
import { SchedulePage } from './features/results/SchedulePage';
import { VoteResultsPage } from './features/results/VoteResultsPage';
import { PersonalResultPage } from './features/taste/PersonalResultPage';
import { TasteSurveyPage } from './features/taste/TasteSurveyPage';

function App() {
  const {
    activeStep,
    copied,
    goToStep,
    group,
    handleCopy,
    handleCreate,
    handleScheduleCandidate,
    handleSelectCandidate,
    handleTasteSubmit,
    handleVote,
    lastVote,
    lastVoteChange,
    members,
    recommendationCandidates,
    resultCandidate,
    resultVoteCounts,
    scheduledCandidate,
    scheduledVoteCounts,
    selectedCandidate,
    selectedCandidateId,
    selectedVariant,
    selectedVoteCounts,
    setSelectedVariant,
  } = useAppFlow();

  const contentByStep = {
    home: <LandingPage goToStep={goToStep} members={members} />,
    login: <LoginPage goToStep={goToStep} />,
    groups: <GroupsPage goToStep={goToStep} members={members} />,
    create: <CreateTripPage goToStep={goToStep} onCreate={handleCreate} />,
    dashboard: (
      <DashboardPage
        copied={copied}
        goToStep={goToStep}
        group={group}
        members={members}
        onCopy={handleCopy}
      />
    ),
    taste: <TasteSurveyPage onSubmitTaste={handleTasteSubmit} />,
    profile: <PersonalResultPage goToStep={goToStep} />,
    analysis: <GroupAnalysisPage goToStep={goToStep} />,
    recommend: (
      <RecommendationVotePage
        candidates={recommendationCandidates}
        onSelectCandidate={handleSelectCandidate}
        onVote={handleVote}
        selectedCandidate={selectedCandidate}
        selectedCandidateId={selectedCandidateId}
        voteCounts={selectedVoteCounts}
      />
    ),
    result: (
      <VoteResultsPage
        alternateCandidates={recommendationCandidates.filter((candidate) => candidate.id !== resultCandidate.id)}
        candidate={resultCandidate}
        lastVote={lastVote}
        lastVoteChange={lastVoteChange}
        onSchedule={handleScheduleCandidate}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        voteCounts={resultVoteCounts}
      />
    ),
    schedule: <SchedulePage candidate={scheduledCandidate} goToStep={goToStep} voteCounts={scheduledVoteCounts} />,
  };

  return (
    <div className="app">
      <Header activeStep={activeStep} goToStep={goToStep} />
      {contentByStep[activeStep]}
    </div>
  );
}

export default App;
