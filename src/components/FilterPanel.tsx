import './FilterPanel.css';
import * as d3 from 'd3';
import React, { useMemo } from 'react';
import { ALL_ORBIT_CLASSES, OrbitClass, Satellite } from '../model/satellite';
import { FilterProps, FilterSettings, SetFilterCallback } from '../model/filter_settings';
import Select, { MultiValue } from "react-select";



export interface FilterPanelProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[];
  filterSettings: FilterSettings;
  onUpdateFilter: SetFilterCallback;
}

interface FilterOptions {
  value: string;
  label: string;
}


/** React component to render the global filter selection UI. */
export default function FilterPanel(props: FilterPanelProps) {
  /** Computes how many rows match the filter after changing some value in it. */
  const countWithUpdatedFilter = (partialFilter: Partial<FilterProps>) => {
    // Note that this is kinda slow to run for all drop-downs, could be optimized by caching by the filter values.
    const newFilter = props.filterSettings.update(partialFilter);
    return d3.sum(props.allSatellites, sat => +newFilter.matchesSatellite(sat));
  }

  /** Updates the global filter. */
  const filterByOrbitClass = (options: MultiValue<FilterOptions>) => {
    const orbitClass: OrbitClass[] | undefined = options.map(option => {
      return option.value as OrbitClass
    })

    const newFilter = props.filterSettings.update({ orbitClasses: orbitClass })
    props.onUpdateFilter(newFilter);
  };

  const filterByOwner = (options: MultiValue<FilterOptions>) => {
    const owners: string[] = options.map(option => option.value);
    const newFilter = props.filterSettings.update({ owners })
    props.onUpdateFilter(newFilter)
  }

  const filterByUsage = (options: MultiValue<FilterOptions>) => {
    const userTypes: string[] = options.map(option => option.value);
    const newFilter = props.filterSettings.update({ userTypes })
    props.onUpdateFilter(newFilter)
  }

  /** TODO: Logic for purpose filter */
  const filterByPurpose = (options: MultiValue<FilterOptions>) => {
    //do stuff
  }

  /** TODO: Logic for active/non-active filter */
  const filterOnActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Do stuff
  }

  const orbitOptions = ALL_ORBIT_CLASSES.map(orbitClass => {
    const count = countWithUpdatedFilter({ orbitClasses: [orbitClass] });
    return { value: orbitClass, label: `${orbitClass} (${count})` };
  });

  // Deduplicate owners from all satellites. Kinda slow so memoized to run only when necessary.
  const uniqueOwners: string[] = useMemo(
    () => Array.from(new Set(props.allSatellites.map(sat => sat.owner))).sort(),
    [props.allSatellites]);
  const ownerOptions = uniqueOwners.map(ownerCode => {
    return { value: ownerCode, label: (ownerCode || 'All countries') };
  });

  /**Called "Sector" in the filter */
  const uniqueUsers: string[] = useMemo(() => {
    const usersSet = new Set<string>();
    for (const sat of props.allSatellites) {
      for (const user of sat.users) {
        usersSet.add(user);
      }
    }
    return Array.from(usersSet).sort();
  }, [props.allSatellites]);
  const usageOption = uniqueUsers.map(user => {
    const count = countWithUpdatedFilter({ userTypes: [user] });
    return { value: user, label: `${user} (${count})` };
  });

  /*TODO: Add names of the unique purposes for the dropdown*/
  const uniquePurposes = ['Eartch Observation', 'and more sectors'].map(
    purpose => {
      return { value: purpose, label: purpose }
    }
  )

  return (
    <div className="FilterPanel">
      <h1 className='headerName'>OrbitEye</h1>
      <p className='SatCountText'>Matches: {props.filteredSatellites.length} of {props.allSatellites.length} satellites.</p>

      <div className='FilterRowDiv'>
        <p className='FilterNameTag'> Orbit type:</p>
        <Select
          className='DropDown'
          options={orbitOptions}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByOrbitClass}
        />
      </div>
      <div className='FilterRowDiv'>
        <p className='FilterNameTag'>Owner:</p>
        <Select
          className='DropDown'
          options={ownerOptions}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByOwner}
        />
      </div>
      <div className='FilterRowDiv'>
        <p className='FilterNameTag'>Sector:</p>
        <Select
          className='DropDown'
          options={usageOption}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByUsage}
        />
      </div>
      <div className='FilterRowDiv'>
        <p className='FilterNameTag'>Purpose:</p>
        <Select
          className='DropDown'
          options={uniquePurposes}
          isMulti
          isClearable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          onChange={filterByPurpose}
        />
      </div>
      <div className='FilterRowDiv'>
        <form>
          <label className='FilterNameTag'>Only active satellites: </label>
          <input name='activeToggle' type={'checkbox'} onChange={e => filterOnActive(e)} defaultChecked={true} />
        </form>
      </div>
    </div>
  );
}
