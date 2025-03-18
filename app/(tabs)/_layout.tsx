import { Tabs } from 'expo-router';
import { Text } from '~/components/ui/text';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabsLayout() {
    // const { isDarkColorScheme } = useColorScheme();

    return (
        <Tabs>
            <Tabs.Screen
                name="pomodoro"
                options={{
                    title: 'Pomodoro',
                    tabBarIcon: ({ color }) => (
                        // You can use whatever icon you want here
                        <TabBarIcon name="hourglass-half" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="cronometer"
                options={{
                    title: 'Stopwatch',
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="clock-o" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="temporizer"
                options={{
                    title: 'Countdown',
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="hourglass-1" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

// You'll need to implement TabBarIcon or import it from a component library
function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={20} style={{ marginBottom: -4 }} {...props} />;
}