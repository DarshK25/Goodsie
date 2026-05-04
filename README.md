# Goodsie

Goodsie is a full-stack MERN product management application for creating, viewing, updating, and deleting products. The application supports product image handling through cloud storage and has been deployed using a production-style AWS setup.

## Live Demo

https://goodsie.onrender.com

## Repository

https://github.com/DarshK25/goodsie

## Overview

Goodsie allows users to manage product listings with details such as product name, price, description, and image. The project was extended beyond a basic CRUD application by deploying it on AWS infrastructure, integrating cloud object storage, configuring reverse proxy routing, enabling monitoring, and containerizing frontend and backend services.

## Features

Product creation, listing, update, and deletion

Product image storage using Amazon S3

React frontend with a responsive user interface

Node.js and Express.js backend REST API

MongoDB Atlas database integration

AWS EC2 deployment

Nginx reverse proxy configuration

Dockerized frontend and backend services

CloudWatch monitoring and alarms

## Tech Stack

### Frontend

React

Vite

Chakra UI

Zustand

### Backend

Node.js

Express.js

MongoDB

Mongoose

Multer

AWS SDK

### Cloud and DevOps

AWS EC2

Amazon S3

Amazon CloudWatch

Nginx

Docker

Docker Compose

MongoDB Atlas

## Architecture

```text
User Browser
    |
    v
EC2 Public IP
    |
    v
Nginx Reverse Proxy
    |
    |---- /          React Frontend
    |
    |---- /api       Node.js Express Backend
                         |
                         v
                    MongoDB Atlas
                         |
                         v
                    Amazon S3
