import { useAppFlow } from './app/useAppFlow';
import { Header } from './components/Header';
import { PrefsModal } from './components/PrefsModal';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { InvitePage } from './features/auth/InvitePage';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { GroupsPage } from './features/groups/GroupsPage';
import { CreateGroupPage } from './features/groups/CreateGroupPage';
import { DashboardPage } from './features/groups/DashboardPage';
import { GroupSettingsPage } from './features/groups/GroupSettingsPage';
import { MenuVotePage } from './features/recommendation/MenuVotePage';
import { VoteDonePage } from './features/recommendation/VoteDonePage';
import { RoundResultPage } from './features/recommendation/RoundResultPage';
import { MenuConfirmedPage } from './features/recommendation/MenuConfirmedPage';
import { RestaurantSearchPage } from './features/recommendation/RestaurantSearchPage';
import { VoteResultsPage } from './features/results/VoteResultsPage';
import { SchedulePage } from './features/results/SchedulePage';
import { ArchivePage } from './features/archive/ArchivePage';
import { MealDetailPage } from './features/archive/MealDetailPage';

const FULL_BLEED = ['login', 'invite', 'onboarding'];

function App() {
  const flow = useAppFlow();
  const { step } = flow;

  const pages = {
    login: <LoginPage flow={flow} />,
    invite: <InvitePage flow={flow} />,
    onboarding: <OnboardingPage flow={flow} />,
    home: <LandingPage flow={flow} />,
    groups: <GroupsPage flow={flow} />,
    create: <CreateGroupPage flow={flow} />,
    dashboard: <DashboardPage flow={flow} />,
    groupsettings: <GroupSettingsPage flow={flow} />,
    recommend: <MenuVotePage flow={flow} />,
    votedone: <VoteDonePage flow={flow} />,
    roundresult: <RoundResultPage flow={flow} />,
    menuconfirmed: <MenuConfirmedPage flow={flow} />,
    restsearch: <RestaurantSearchPage flow={flow} />,
    result: <VoteResultsPage flow={flow} />,
    schedule: <SchedulePage flow={flow} />,
    archive: <ArchivePage flow={flow} />,
    mealdetail: <MealDetailPage flow={flow} />,
  };

  const isApp = !FULL_BLEED.includes(step);

  return (
    <div className="app">
      {isApp ? <Header flow={flow} /> : null}
      {pages[step] || pages.login}
      {flow.prefsOpen ? <PrefsModal flow={flow} /> : null}
    </div>
  );
}

export default App;
