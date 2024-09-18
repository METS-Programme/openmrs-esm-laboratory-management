import React, { useEffect, useState } from "react";
import { SideNavItem } from "./side-nav-item";
import { SideNavLink } from "@carbon/react";
import { navigate, userHasAccess, useSession } from "@openmrs/esm-framework";
import { useLocation, useParams } from "react-router-dom";

interface SideNavLinkProps {
  index: number;
  tab: SideNavItem;
  onSelectTab: (index: number) => void;
}

const SideNavLinkItem: React.FC<SideNavLinkProps> = ({
  index,
  tab,
  onSelectTab,
}) => {
  const session = useSession();
  const [canSee, setCanSee] = useState(false);
  const { pathname } = useLocation();
  const queryParams = useParams();
  useEffect(() => {
    setCanSee(
      !Boolean(tab.privilege) ||
        (session?.user && userHasAccess(tab.privilege, session.user))
    );
  }, [session, tab.privilege]);

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(window.location.pathname + window.location.search === tab.link);
    // eslint-disable-next-line
  }, [pathname, queryParams]);

  return (
    <>
      {canSee && (
        <SideNavLink
          key={index}
          isActive={isActive}
          onClick={() => {
            onSelectTab(index); // Call onSelectTab to update selectedTab in the parent
            navigate({
              to: tab.link,
            });
          }}
        >
          {tab.name}
        </SideNavLink>
      )}
    </>
  );
};

export default SideNavLinkItem;
