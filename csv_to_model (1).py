
# coding: utf-8

# # TODO
# 
# * add documetation to readData()
# * maybe come up with a better way to organize the coord attributes of the Relationship object

# In[1]:

import igraph as ig
import numpy as np
from dateutil import parser
import numpy as np
import csv


# In[2]:

class Entity:
    def __init__(self, primary_key, name, starting_date, ending_date):
        self.primary_key = primary_key
        self.name = name
        self.starting_date = starting_date
        self.ending_date = ending_date 
        self.x = None
        self.y = None
        self.z1 = None
        self.z2 = None
        
    def get_string_representation(self):
        fields = [self.primary_key, 
                  self.name, 
                  self.starting_date, 
                  self.ending_date, 
                  self.x, 
                  self.y, 
                  self.z1, 
                  self.z2]
        return [str(field) for field in fields]
    
        
        
class Relationship:
    def __init__(self, primary_key, entity_key_1, entity_key_2,
                 relationship_type, starting_date = None, ending_date = None):
        
        self.primary_key = primary_key
        self.entity_key_1 = entity_key_1
        self.entity_key_2 = entity_key_2
        self.relationship_type = relationship_type
        self.starting_date = starting_date
        self.ending_date = ending_date
        self.x1 = None
        self.y1 = None
        self.z1 = None
        self.x2 = None
        self.y2 = None
        self.z2 = None
        self.x3 = None
        self.y3 = None
        self.z3 = None
        self.x4 = None
        self.y4 = None
        self.z4 = None
    
    def get_string_representation(self):
        fields = [self.primary_key,
                  self.entity_key_1,
                  self.entity_key_2,
                  self.relationship_type,
                  self.starting_date,
                  self.ending_date,
                  self.x1,
                  self.y1,
                  self.z1,
                  self.x2,
                  self.y2,
                  self.z2,
                  self.x3,
                  self.y3,
                  self.z3,
                  self.x4,
                  self.y4,
                  self.z4]
        
        return [str(field) for field in fields]
        


# In[3]:

def readData(entity_csv, relationship_csv):
    '''Parses data from entity_csv and relationship csv into python objects 
    If a record cannot be parsed, the function will print out that record.
    If a relationship refers to an entity not found, that record will also
    be printed. 
    
    '''
    entityList = []
    relationshipList = []
    
    ##Indexes for entities csv file
    idIndex=0
    nameIndex=0
    dobIndex=0
    endIndex=0
    
    ##Indexes for relationships csv file
    entityoneIndex=0
    entitytwoIndex=0
    relationshipIndex=0
    
    ##set of entity ids 
    entity_set = set()
    
    print('Reading entities...')
        
    with open(entity_csv, 'r') as f:
        first_line=f.readline().replace('\n','')
        first_line=first_line.split(',')
        idIndex=first_line.index("id")
        nameIndex=first_line.index("name")
        dobIndex=first_line.index("dob")
        endIndex=first_line.index("active")
        index = 1 # keeping track of row index for troubleshooting 
        for item in f:
            index += 1
            item=item.split(',')
            try:
                dystart=parser.parse(item[dobIndex])
                dyend=parser.parse(item[endIndex])
                if item[idIndex] in entity_set:
                    print('Repeat Record', item)
                    print('Record index', index)
                    continue
                else:
                    entityList.append(Entity(item[idIndex],item[nameIndex],dystart,dyend))
                    entity_set.add(item[idIndex])
            except ValueError:
                print('Record could not be parsed', item)
                print('Record index', index)
                continue
    print('Reading relationships...')
    with open(relationship_csv,"r") as f:
        first_line=f.readline().replace('\n','')
        first_line=first_line.split(',')
        idIndex=first_line.index("id")
        entityoneIndex=first_line.index("pid_1")
        entitytwoIndex=first_line.index("pid_2")
        relationshipIndex=first_line.index("relationship")
        dobIndex=first_line.index("s_date")
        endIndex=first_line.index("end_date")
        index = 1
        for item in f:
            index += 1
            item=item.split(',')
            try:
                if len(item[dobIndex]) == 0 or item[dobIndex] == '\n':
                    dystart = None
                else:
                    dystart = parser.parse(item[dobIndex])
                    
                if len(item[endIndex]) == 0 or item[endIndex] == '\n':
                    dyend = None
                else:
                    dyend = parser.parse(item[endIndex])
            
                if item[entityoneIndex] not in entity_set:
                    print('Refers to entity not found', item[entityoneIndex])
                    print('Record index', index)
                    continue
                if item[entitytwoIndex] not in entity_set:
                    print('Refers to entity not found', item[entitytwoIndex])
                    print('Record index', index)
                    continue
                relationshipList.append(Relationship(item[idIndex],item[entityoneIndex],item[entitytwoIndex]
                                    ,item[relationshipIndex],dystart,dyend))
            except ValueError:
                print('Record could not be parsed', item)
                print('Record index', index)
                print(len(item[dobIndex]))
                continue

    return entityList, relationshipList

entity_list, relationship_list = readData("data/Cameron_Persons.csv", "data/Cameron_relationships.csv")


# In[4]:

def primary_key_map(entity_list):
    '''
    Generates a mapping of the primary keys of the entities, or people, and maps it to a unique integer starting at 0
    
    Arguments:
        entity_list: a list of Entity objects
    
    Returns:
        primary_key_mapper: a dictionary that takes an Entity's primary key as an index
            and returns a unique integer >= 0
        
        inverse_primary_key_mapper: a dictionary that takes an index and returns
            the corresponding Entity primary key
            
    '''
    primary_key_mapper = dict()
    inverse_primary_key_mapper = dict()
    
    entity_primary_keys = [entity.primary_key for entity in entity_list]
    
    for index, primary_key in enumerate(sorted(entity_primary_keys)):
        primary_key_mapper[primary_key] = index 
        inverse_primary_key_mapper[index] = primary_key
    
    return primary_key_mapper, inverse_primary_key_mapper


# In[5]:

def relationships_to_edge_list(relationship_list, primary_key_mapper):  
    '''
    Creates an edge list from the relationship list and a primary key map
    
    Arguments:
        relationship_list: a list of Relationship objects
        primary_key_mapper: a dictionary that maps entity primary keys to a unique integer
    
    Returns:
        a list of tuples that represents an edge list
    '''
    return [(primary_key_mapper[relationship.entity_key_1], primary_key_mapper[relationship.entity_key_2])
           for relationship in relationship_list]


# In[6]:

def time_span(entity_list):
    '''
    Gives the first date and last date found amoung the attributes of the entities 
    
    Arguments:
        entity_list: a list of Entity objects
    
    Returns: 
        the first and last date as datetime objects
    '''
    times = []
    
    for entity in entity_list:
        times.append(entity.starting_date)
        times.append(entity.ending_date)
        

    times = sorted(times)
    
    return times[0], times[-1]


# In[7]:

get_entity = dict() # a way to get an entity by its primary key
for entity in entity_list:
    get_entity[entity.primary_key] = entity


# In[8]:

#initializing network 
relationship_network = ig.Graph()
relationship_network.add_vertices(len(entity_list))


# In[9]:

primary_key_mapper, inverse_primary_key_mapper = primary_key_map(entity_list) #getting key mappers
edge_list = relationships_to_edge_list(relationship_list, primary_key_mapper) #generating edge list
relationship_network.add_edges(edge_list) #adding edge list to graph
starting_time, ending_time = time_span(entity_list) #getting starting and ending times 
n_day_duration = (ending_time - starting_time).days #getting duration as days 


# In[10]:

entity_xy_coords = np.array(relationship_network.layout('kk')) # getting 2d coordiantes of entities
model_height = np.ptp(entity_xy_coords, axis = 0).max().round() # getting a good model height


# In[11]:

# setting the geometry of each entity
for index, coord in enumerate(entity_xy_coords):
    entity_primary_key = inverse_primary_key_mapper[index]
    entity = get_entity[entity_primary_key]
    entity.x = coord[0]
    entity.y = coord[1]
    entity.z1 = (entity.starting_date - starting_time).days/n_day_duration * model_height
    entity.z2 = (entity.ending_date - starting_time).days/n_day_duration * model_height


# In[12]:

# setting the geometry of each relationship
for relationship in relationship_list:
    entity_1 = get_entity[relationship.entity_key_1]
    entity_2 = get_entity[relationship.entity_key_2]
    
    relationship.x1 = entity_1.x
    relationship.y1 = entity_1.y
    
    relationship.x2 = entity_1.x
    relationship.y2 = entity_1.y
    
    relationship.x3 = entity_2.x
    relationship.y3 = entity_2.y
    
    relationship.x4 = entity_2.x
    relationship.y4 = entity_2.y
    
    
    if relationship.starting_date is None and relationship.ending_date is None: # if relationship exists during full life of both entities
        relationship.z1 = min(entity_1.z1, entity_2.z1)
        relationship.z3 = relationship.z1

        relationship.z2 = entity_1.z2
        relationship.z4 = entity_2.z2
        
    else:
        bottom_z = (relationship.starting_date - starting_time).days/n_day_duration * model_height
        top_z = (relationship.ending_date - starting_time).days/n_day_duration * model_height
        
        relationship.z1 = bottom_z
        relationship.z3 = bottom_z
        
        relationship.z2 = top_z
        relationship.z4 = top_z


# In[13]:

def write_entities(entity_list, csv_name):
    with open(csv_name + '.csv', mode = 'w', newline = '') as entity_file:
        entity_writer = csv.writer(entity_file)
        entity_writer.writerow(['primary_key','name','starting_date','ending_date','x','y','z1','z2'])
        for entity in entity_list:
            entity_writer.writerow(entity.get_string_representation())


# In[14]:

def write_relationships(relationship_list, csv_name):
    with open(csv_name + '.csv', mode = 'w', newline = '') as relationship_file:
        relationship_writer = csv.writer(relationship_file)
        relationship_writer.writerow(['primary_key',
                                      'entity_key_1',
                                      'entity_key_2',
                                      'relationship_type',
                                      'starting_date',
                                      'ending_date',
                                      'x1',
                                      'y1',
                                      'z1',
                                      'x2',
                                      'y2',
                                      'z2',
                                      'x3',
                                      'y3',
                                      'z3',
                                      'x4',
                                      'y4',
                                      'z4'])

        for relationship in relationship_list:
            relationship_writer.writerow(relationship.get_string_representation())


# In[15]:

write_entities(entity_list, 'data/cameron_entity_output')
write_relationships(relationship_list, 'data/cameron_relationship_output')


# In[ ]:



