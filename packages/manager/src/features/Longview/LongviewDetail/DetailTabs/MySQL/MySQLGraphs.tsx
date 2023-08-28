import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Grid } from 'src/components/Grid';
import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import { Paper } from 'src/components/Paper';
import {
  formatNetworkTooltip,
  getMaxUnitAndFormatNetwork,
} from 'src/features/Longview/shared/utilities';

import { LongviewProcesses, MySQLResponse } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import { ProcessGraphs, useStyles } from '../ProcessGraphs';

interface Props {
  data?: MySQLResponse;
  end: number;
  error?: string;
  isToday: boolean;
  loading: boolean;
  processesData: LongviewProcesses;
  processesError?: string;
  processesLoading: boolean;
  start: number;
  timezone: string;
}

export const MySQLGraphs = (props: Props) => {
  const {
    data,
    end,
    error,
    isToday,
    loading,
    processesData,
    processesError,
    processesLoading,
    start,
    timezone,
  } = props;

  const theme = useTheme();
  const { classes } = useStyles();

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const selectQueries = data?.Com_select ?? [];
  const updateQueries = data?.Com_update ?? [];
  const insertQueries = data?.Com_insert ?? [];
  const deleteQueries = data?.Com_delete ?? [];
  const abortedConnections = data?.Aborted_connects ?? [];
  const abortedClients = data?.Aborted_clients ?? [];
  const slowQueries = data?.Slow_queries ?? [];
  const connections = data?.Connections ?? [];
  const inbound = data?.Bytes_received ?? [];
  const outbound = data?.Bytes_sent ?? [];

  const { formatNetwork, maxUnit } = getMaxUnitAndFormatNetwork(
    inbound,
    outbound
  );

  return (
    <Paper className={classes.root}>
      <Grid container direction="column" spacing={0}>
        <Grid item xs={12}>
          <LongviewLineGraph
            data={[
              {
                backgroundColor: theme.graphs.queries.select,
                borderColor: 'transparent',
                data: _convertData(selectQueries, start, end),
                label: 'SELECT',
              },
              {
                backgroundColor: theme.graphs.queries.update,
                borderColor: 'transparent',
                data: _convertData(updateQueries, start, end),
                label: 'UPDATE',
              },
              {
                backgroundColor: theme.graphs.queries.insert,
                borderColor: 'transparent',
                data: _convertData(insertQueries, start, end),
                label: 'INSERT',
              },
              {
                backgroundColor: theme.graphs.queries.delete,
                borderColor: 'transparent',
                data: _convertData(deleteQueries, start, end),
                label: 'DELETE',
              },
            ]}
            ariaLabel="Queries Per Second Graph"
            error={error}
            loading={loading}
            nativeLegend
            showToday={isToday}
            subtitle="queries/s"
            timezone={timezone}
            title="Queries"
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid className={classes.smallGraph} item sm={6} xs={12}>
              <LongviewLineGraph
                data={[
                  {
                    backgroundColor: theme.graphs.network.inbound,
                    borderColor: 'transparent',
                    data: _convertData(inbound, start, end),
                    label: 'Inbound',
                  },
                  {
                    backgroundColor: theme.graphs.network.outbound,
                    borderColor: 'transparent',
                    data: _convertData(outbound, start, end),
                    label: 'Outbound',
                  },
                ]}
                ariaLabel="Throughput Graph"
                error={error}
                formatData={formatNetwork}
                formatTooltip={formatNetworkTooltip}
                loading={loading}
                nativeLegend
                showToday={isToday}
                subtitle={`${maxUnit}/s`}
                timezone={timezone}
                title="Throughput"
                unit={'/s'}
              />
            </Grid>
            <Grid className={classes.smallGraph} item sm={6} xs={12}>
              <LongviewLineGraph
                data={[
                  {
                    backgroundColor: theme.graphs.connections.accepted,
                    borderColor: 'transparent',
                    data: _convertData(connections, start, end),
                    label: 'Connections',
                  },
                ]}
                ariaLabel="Connections Per Second Graph"
                error={error}
                loading={loading}
                nativeLegend
                showToday={isToday}
                subtitle="connections/s"
                timezone={timezone}
                title="Connections"
                unit={' connections/s'}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid className={classes.smallGraph} item sm={6} xs={12}>
              <LongviewLineGraph
                data={[
                  {
                    backgroundColor: theme.graphs.slowQueries,
                    borderColor: 'transparent',
                    data: _convertData(slowQueries, start, end),
                    label: 'Slow Queries',
                  },
                ]}
                ariaLabel="Slow Queries Graph"
                error={error}
                loading={loading}
                nativeLegend
                showToday={isToday}
                timezone={timezone}
                title="Slow Queries"
              />
            </Grid>
            <Grid className={classes.smallGraph} item sm={6} xs={12}>
              <LongviewLineGraph
                data={[
                  {
                    backgroundColor: theme.graphs.aborted.connections,
                    borderColor: 'transparent',
                    data: _convertData(
                      abortedConnections,
                      start,
                      end,
                      formatAborted
                    ),
                    label: 'Connections',
                  },
                  {
                    backgroundColor: theme.graphs.aborted.clients,
                    borderColor: 'transparent',
                    data: _convertData(
                      abortedClients,
                      start,
                      end,
                      formatAborted
                    ),
                    label: 'Clients',
                  },
                ]}
                ariaLabel="Aborted Clients and Connections Graph"
                error={error}
                loading={loading}
                nativeLegend
                showToday={isToday}
                timezone={timezone}
                title="Aborted"
              />
            </Grid>
          </Grid>
        </Grid>
        <ProcessGraphs
          data={processesData}
          end={end}
          error={processesError || error}
          isToday={isToday}
          loading={processesLoading}
          start={start}
          timezone={timezone}
        />
      </Grid>
    </Paper>
  );
};

const formatAborted = (value: null | number) => {
  if (value === null) {
    return value;
  }
  return Math.ceil(value);
};
