jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    ScrollView: require('react-native').ScrollView,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    Directions: {},
    gestureHandlerRootHOC: jest.fn(comp => comp),
  };
});

jest.mock('react-native-worklets', () => ({
  defaultContext: {},
  createContext: jest.fn(),
  createRunOnJS: jest.fn(),
  createSharedValue: jest.fn(() => ({value: 0})),
}));

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: jest.fn(comp => comp),
      View,
      Text: require('react-native').Text,
      ScrollView: require('react-native').ScrollView,
      FlatList: require('react-native').FlatList,
    },
    useSharedValue: jest.fn(init => ({value: init})),
    useAnimatedStyle: jest.fn(() => ({})),
    useDerivedValue: jest.fn(fn => ({value: fn()})),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    withTiming: jest.fn(val => val),
    withSpring: jest.fn(val => val),
    withDelay: jest.fn((_, val) => val),
    runOnJS: jest.fn(fn => fn),
    runOnUI: jest.fn(fn => fn),
    Easing: {bezier: jest.fn()},
    FadeIn: {duration: jest.fn(() => ({delay: jest.fn()}))},
    FadeOut: {duration: jest.fn(() => ({delay: jest.fn()}))},
    Layout: {},
    SlideInRight: {},
    SlideOutLeft: {},
    createAnimatedComponent: jest.fn(comp => comp),
  };
});

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  enableFreeze: jest.fn(),
  Screen: require('react-native').View,
  ScreenContainer: require('react-native').View,
  NativeScreen: require('react-native').View,
  NativeScreenContainer: require('react-native').View,
  ScreenStack: require('react-native').View,
  ScreenStackHeaderConfig: require('react-native').View,
  ScreenStackHeaderSubview: require('react-native').View,
  SearchBar: require('react-native').View,
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  const frame = {x: 0, y: 0, width: 390, height: 844};

  const SafeAreaInsetsContext = React.createContext(inset);
  const SafeAreaFrameContext = React.createContext(frame);

  return {
    SafeAreaProvider: ({children}) =>
      React.createElement(
        SafeAreaInsetsContext.Provider,
        {value: inset},
        React.createElement(SafeAreaFrameContext.Provider, {value: frame}, children),
      ),
    SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
    SafeAreaView: ({children, ...props}) =>
      React.createElement(require('react-native').View, props, children),
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: {insets: inset, frame},
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({children}) => React.createElement(React.Fragment, null, children),
      Screen: () => React.createElement(React.Fragment, null, null),
    }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({children}) => React.createElement(React.Fragment, null, children),
      Screen: () => React.createElement(React.Fragment, null, null),
    }),
  };
});

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const View = require('react-native').View;
  const Picker = (props) => React.createElement(View, props, props.children);
  Picker.Item = (props) => React.createElement(View, props, null);
  return {Picker};
});
