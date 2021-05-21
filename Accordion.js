//https://github.com/salamancajr/react-native-reanimated-collapsible
import React, { useMemo, useReducer } from 'react';
import Animated, { EasingNode } from 'react-native-reanimated';
import PropTypes from 'prop-types';

const {
  Value,
  block,
  startClock,
  Clock,
  cond,
  eq,
  timing,
  set,
  useCode,
  and,
} = Animated;

const reducer = (state, action) => {
  switch (action.type) {
    case 'initialize':
      return action.payload;
    default:
      state;
  }
};

const AccordionWrapper = ({
  style,
  children,
  minHeight = 0,
  expand = false,
  initOpen = true,
  duration = 400,
  ...props
}) => {
  const [reducerState, dispatch] = useReducer(reducer, {
    height: new Value(minHeight),
    done: false,
  });

  const { height, done } = reducerState;

  let { animatedHeight, initOpenDone } = useMemo(
    () => ({
      animatedHeight: new Value(minHeight),
      initOpenDone: new Value(minHeight),
    }),
    [],
  );

  const clock = new Clock();

  useCode(() => {
    const state = {
      position: animatedHeight,
      finished: new Value(minHeight),
      time: new Value(0),
      frameTime: new Value(0),
    };
    const config = {
      toValue: props.height ? new Value(props.height) : height,
      duration,
      easing: EasingNode.linear,
    };

    return block([
      cond(and(eq(initOpen, 1), eq(initOpenDone, 0)), [
        set(animatedHeight, props.height ? new Value(props.height) : height),
        set(initOpenDone, 1),
      ]),
      cond(eq(expand, initOpen ? 0 : 1), [
        set(config.toValue, props.height ? new Value(props.height) : height),
        startClock(clock),
        timing(clock, state, config),
      ]),
      cond(eq(expand, initOpen ? 1 : 0), [
        set(config.toValue, minHeight),
        startClock(clock),
        timing(clock, state, config),
      ]),
    ]);
  }, [expand, done]);

  return (
    <Animated.View
      onLayout={e => {
        if (e.nativeEvent.layout.height && !done) {
          dispatch({
            type: 'initialize',
            payload: {
              height: new Value(e.nativeEvent.layout.height),
              done: true,
            },
          });
        }
      }}
      style={[
        style,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          overflow: 'hidden',
          height: initOpen && !done ? undefined : animatedHeight,
        },
      ]}>
      {children}
    </Animated.View>
  );
};

AccordionWrapper.propTypes = {
  style: PropTypes.object,
  children: PropTypes.node.isRequired,
  expand: PropTypes.bool.isRequired,
  initOpen: PropTypes.bool,
  duration: PropTypes.number,
  height: PropTypes.number,
};

AccordionWrapper.defaultProps = {
  style: {},
  initOpen: false,
  duration: 400,
};

export default AccordionWrapper;
