#!/usr/bin/env python3

import collections
import fileinput
import json

if __name__ == '__main__':
    ing_file = 'public/ingredients.json'
    recipe = collections.OrderedDict()

    with open(ing_file) as fh:
        ingredients = json.load(fh)

    for line in fileinput.input():
        line = line.strip()
        if not line:
            continue
        if line.endswith('bell pepper'):
            line += 's'  # Sue me
        tokens = line.split()

        if tokens[0][-1] == 'g' and tokens[0][0].isdigit():
            # TODO: Interpret amount and find ingredient
            if 'mixed' in tokens:
                tokens.remove('mixed')

            if 'bell pepper' in line and 'green' in tokens:
                tokens.remove('green')

            num_grams = int(tokens[0].rstrip('g'))
            name = ' '.join(tokens[1:]).capitalize()
            if name in ('Dried chickpeas', 'Dried black beans'):
                name = 'Dried beans'

            if name not in ingredients:
                print(f"Unrecognized ingredient \"{name}\"; adding anyway")

            recipe[name] = {"quantity": num_grams, "units": "g"}

            # Finally
            continue

        if 'packet' in line:
            # TODO: Figure out how many packets
            if 'packet' in tokens:
                tokens.remove('packet')
            elif 'packets' in tokens:
                tokens.remove('packets')

            num_packets = 1
            for token in tokens:
                if token.isdigit():
                    num_packets = int(token)
                    tokens.remove(token)
                    break
            name = ' '.join(tokens).capitalize()
            recipe[name] = {"quantity": num_packets, "units": "packet"}

            # Finally
            continue

        if 'water' in tokens:
            num_oz = 0
            print(tokens)
            for token in tokens:
                if token.rstrip('oz').isdigit():
                    num_oz = int(token.rstrip('oz'))
                    break
            recipe['Water'] = {'quantity': num_oz, 'units': 'oz'}

            # Finally
            continue

        # Otherwise: 
        print(f"Can't easily handle \"{line}\"; skipping")

    print(json.dumps(recipe))
