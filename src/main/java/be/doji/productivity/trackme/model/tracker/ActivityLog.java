package be.doji.productivity.trackme.model.tracker;

import be.doji.productivity.trackme.TrackMeConstants;
import be.doji.productivity.trackme.model.tasks.Activity;

import java.util.List;
import java.util.UUID;

/**
 * Created by Doji on 22/10/2017.
 */
public class ActivityLog {

    private UUID activityId;
    private List<TimeLog> logPoints;

    public ActivityLog(Activity activity) {
        this.activityId = activity.getId();
    }

    public ActivityLog(UUID activityId) {
        this.activityId = activityId;
    }

    public UUID getActivityId() {
        return activityId;
    }

    public void setActivityId(UUID activityId) {
        this.activityId = activityId;
    }

    public List<TimeLog> getLogPoints() {
        return logPoints;
    }

    public void setLogPoints(List<TimeLog> logPoints) {
        this.logPoints = logPoints;
    }

    public String toString() {
        StringBuilder logLine = new StringBuilder();
        logLine.append(TrackMeConstants.INDICATOR_LOG_START);
        logLine.append(" ");
        logLine.append(activityId.toString());

        logLine.append(System.lineSeparator());
        for (TimeLog logPoint : logPoints) {
            logLine.append(logLine.toString());
            logLine.append(System.lineSeparator());
        }
        logLine.append(TrackMeConstants.INDICATOR_LOG_END);
        return logLine.toString();
    }

    public void addLogPoint(TimeLog timeLog) {
        this.logPoints.add(timeLog);
    }
}
