FROM osrf/ros:humble-desktop-full-jammy

# Install necessary packages
RUN apt-get update && \
    apt-get install -y \
    curl \
    build-essential \
    python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js (latest LTS version) and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install React and dependencies for front-end testing
WORKDIR /app
COPY ./package.json ./
RUN npm install

# Install ROS2 bridge dependencies
RUN apt-get update && \
    apt-get install -y \
    ros-humble-rosbridge-server && \
    rm -rf /var/lib/apt/lists/*

# Set up the ROS environment
RUN echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc

# Copy app files
# COPY . /app

# Expose ROS bridge and web server ports
EXPOSE 9090
EXPOSE 3000

# Start script for ROS bridge and web server

CMD ["bash", "-c", "source /opt/ros/humble/setup.bash && ros2 launch rosbridge_server rosbridge_websocket_launch.xml & npm run dev"]
